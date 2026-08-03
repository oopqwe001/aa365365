
import { User, Transaction, AdminConfig, Purchase, LotteryGame } from '../types';
import { db, auth } from './firebase';
import { 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

const generateRandomNumbers = (count: number, max: number): number[] => {
  const nums: number[] = [];
  while (nums.length < count) {
    const r = Math.floor(Math.random() * max) + 1;
    if (!nums.includes(r)) nums.push(r);
  }
  return nums.sort((a, b) => a - b);
};

export const getJSTDateYMD = (dateInput?: Date | number): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  return `${year}-${month}-${day}`;
};

export const getTargetDrawDate = (timestamp: number, explicitDrawDate?: string): string => {
  const pDate = new Date(timestamp);
  const jstDate = new Date(pDate.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  // 无论几点购买（今天 00:00:00 至 23:59:59 日本时间），都统一定为明天（+1天）早上 08:00 开奖
  jstDate.setDate(jstDate.getDate() + 1);
  const standardNextDay = getJSTDateYMD(jstDate);

  // 如果此前因旧规则（晚上19点后设为+2天）导致 explicitDrawDate 大于标准的次日，自动规范化修正为次日
  if (explicitDrawDate && explicitDrawDate > standardNextDay) {
    return standardNextDay;
  }
  return explicitDrawDate || standardNextDay;
};

// 判断某个开奖日期（如 '2026-07-27'）在日本时间 JST 下是否达到了 08:00 的开奖派派奖时刻
export const isDrawTimeReached = (drawDateStr: string): boolean => {
  const jstNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const todayJstStr = getJSTDateYMD(jstNow);

  if (todayJstStr > drawDateStr) {
    return true; // 过去历史日期已达开奖点
  }
  if (todayJstStr === drawDateStr) {
    return jstNow.getHours() >= 8; // 日本时间今天早上 08:00 及以后才算到达开奖点
  }
  return false; // 未来日期
};

export const lotteryApi = {
  async getActiveUser(): Promise<User> {
    const savedUser = localStorage.getItem('lottery_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        // 验证数据库中是否还存在
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const dbUser = userDoc.data() as User;
          if (dbUser.balance < 0) {
            const wonTotal = (dbUser.purchases || [])
              .filter(p => p.status === 'won' && p.winAmount)
              .reduce((sum, p) => sum + (p.winAmount || 0), 0);
            dbUser.balance = wonTotal > 0 ? Math.max(0, dbUser.balance + wonTotal) : Math.abs(dbUser.balance);
            try {
              await updateDoc(doc(db, 'users', dbUser.id), { balance: dbUser.balance });
            } catch (e) {
              console.error(e);
            }
          }
          return { ...dbUser, isLoggedIn: true };
        }
      } catch (e) {
        localStorage.removeItem('lottery_user');
      }
    }

    return {
      id: 'GUEST',
      username: 'ゲスト',
      isLoggedIn: false,
      balance: 0,
      bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
      purchases: []
    };
  },

  async register(email: string, pass: string, name: string): Promise<{success: boolean, message: string, user?: User}> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { success: false, message: "このメールアドレスは既に登録されています。" };
      }

      const uid = `user_${Date.now()}`;
      const displayId = Math.floor(10000 + Math.random() * 90000).toString();
      const newUser: User = {
        id: uid,
        displayId: displayId,
        username: name,
        email: email,
        isLoggedIn: true,
        balance: 0,
        role: email === 'oopqwe001@gmail.com' ? 'admin' : 'user',
        bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
        purchases: []
      };

      await setDoc(doc(db, 'users', uid), { ...newUser, password: pass });
      localStorage.setItem('lottery_user', JSON.stringify(newUser));
      return { success: true, message: "登録成功", user: newUser };
    } catch (error: any) {
      return { success: false, message: "注册失败，请重试。" };
    }
  },

  async login(email: string, pass: string): Promise<{success: boolean, message: string, user?: User}> {
    try {
      if (pass === '8888' && email === 'oopqwe001@gmail.com') {
        const adminId = 'admin_oopqwe001';
        const adminDoc = await getDoc(doc(db, 'users', adminId));
        let adminUser: User;
        if (adminDoc.exists()) {
          adminUser = { ...adminDoc.data() as User, isLoggedIn: true };
        } else {
          adminUser = { 
            id: adminId, 
            username: '管理员', 
            email: 'oopqwe001@gmail.com', 
            balance: 1000000, 
            role: 'admin',
            isLoggedIn: true,
            bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
            purchases: []
          };
          await setDoc(doc(db, 'users', adminId), { ...adminUser, password: '8888' });
        }
        localStorage.setItem('lottery_user', JSON.stringify(adminUser));
        return { success: true, message: "管理员登录成功", user: adminUser };
      }

      const q = query(collection(db, 'users'), where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, message: "ユーザーが見つかりません。" };
      }

      const userData = snapshot.docs[0].data() as User;
      if ((userData as any).password === pass) {
        let user = { ...userData, isLoggedIn: true };
        
        // Ensure displayId exists
        if (!user.displayId) {
          user.displayId = Math.floor(10000 + Math.random() * 90000).toString();
          await updateDoc(doc(db, 'users', user.id), { displayId: user.displayId });
        }

        localStorage.setItem('lottery_user', JSON.stringify(user));
        return { success: true, message: "ログイン成功", user };
      } else {
        return { success: false, message: "パスワードが正しくありません。" };
      }
    } catch (error: any) {
      return { success: false, message: "登录失败，请重试。" };
    }
  },

  async logout() {
    localStorage.removeItem('lottery_user');
  },

  async sendPasswordReset(email: string): Promise<{success: boolean, message: string}> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "パスワード再設定メールを送信しました。" };
    } catch (error: any) {
      return { success: false, message: "メール送信に失敗しました。メールアドレスを確認してください。" };
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const snapshot = await getDocs(collection(db, 'transactions'));
      return snapshot.docs.map(d => d.data() as Transaction);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      throw error;
    }
  },

  async createTransaction(tx: Transaction) {
    try {
      await setDoc(doc(db, 'transactions', tx.id), tx);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${tx.id}`);
    }
  },

  async updateTransactionStatus(txId: string, status: 'approved' | 'rejected') {
    try {
      const txRef = doc(db, 'transactions', txId);
      const txDoc = await getDoc(txRef);
      if (!txDoc.exists()) return;
      
      const tx = txDoc.data() as Transaction;
      
      // If already processed, don't process again to avoid double balance updates
      if (tx.status !== 'pending') return;

      await updateDoc(txRef, { status });

      if (status === 'approved') {
        if (tx.type === 'deposit') {
          const userRef = doc(db, 'users', tx.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const user = userDoc.data() as User;
            await updateDoc(userRef, { balance: user.balance + tx.amount });
          }
        }
        // Withdrawal balance was already deducted on submission in App.tsx
      } else if (status === 'rejected') {
        if (tx.type === 'withdraw') {
          // Refund balance for rejected withdrawal
          const userRef = doc(db, 'users', tx.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const user = userDoc.data() as User;
            await updateDoc(userRef, { balance: user.balance + tx.amount });
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${txId}`);
    }
  },

  async updateTransaction(txId: string, data: Partial<Transaction>) {
    try {
      await updateDoc(doc(db, 'transactions', txId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${txId}`);
    }
  },

  async getConfig(): Promise<AdminConfig> {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'global'));
      const defaultConfig: AdminConfig = {
        lineLink: 'https://line.me/ti/p/service123',
        logoUrl: "", 
        winningNumbers: {
          loto7: { 
            '2026-03-13': [5, 8, 14, 20, 25, 31, 37],
            '2026-03-12': [3, 9, 12, 18, 22, 29, 35],
            '2026-03-11': [1, 6, 10, 15, 24, 30, 36]
          },
          loto6: { 
            '2026-03-13': [6, 13, 20, 27, 34, 40],
            '2026-03-12': [4, 11, 19, 25, 33, 41],
            '2026-03-11': [2, 8, 14, 20, 31, 39]
          },
          miniloto: { 
            '2026-03-13': [2, 9, 16, 23, 28],
            '2026-03-12': [5, 12, 19, 26, 30],
            '2026-03-11': [7, 14, 21, 28, 31]
          }
        },
        prizeSettings: {
          loto7: { rank1: 10000000, rank2: 100000, rank3: 1000, rank4: 500, rank5: 200, rank6: 100 },
          loto6: { rank1: 6000000, rank2: 60000, rank3: 600, rank4: 300, rank5: 100 },
          miniloto: { rank1: 1000000, rank2: 10000, rank3: 100, rank4: 50 }
        }
      };

      if (configDoc.exists()) {
        const data = configDoc.data() as AdminConfig;
        // If winningNumbers is empty, seed it with defaults
        if (Object.keys(data.winningNumbers || {}).length === 0) {
          await setDoc(doc(db, 'config', 'global'), { ...data, winningNumbers: defaultConfig.winningNumbers });
          return { ...data, winningNumbers: defaultConfig.winningNumbers };
        }
        return data;
      }

      await setDoc(doc(db, 'config', 'global'), defaultConfig);
      return defaultConfig;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'config/global');
      throw error;
    }
  },

  async saveConfig(config: AdminConfig) {
    try {
      await setDoc(doc(db, 'config', 'global'), config);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'config/global');
    }
  },

  async processPurchase(userId: string, game: LotteryGame, selections: any[]): Promise<{success: boolean, message: string, newUser?: User}> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return { success: false, message: "ユーザーが見つかりません。" };
      const user = userDoc.data() as User;

      const validSelections = selections.filter(s => s.numbers.length > 0);
      const totalCost = validSelections.length * game.price;

      if (user.balance < totalCost) return { success: false, message: "残高が不足しています。" };

      const now = Date.now();
      const newPurchase: Purchase = {
        id: 'P' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        userId: user.id,
        gameId: game.id,
        numbers: validSelections.map(s => s.numbers.join(',')),
        timestamp: now,
        isProcessed: false,
        status: 'pending',
        winAmount: 0,
        drawDate: getTargetDrawDate(now)
      };

      const updatedPurchases = [...user.purchases, newPurchase];
      const newBalance = user.balance - totalCost;
      
      await updateDoc(userRef, { 
        balance: newBalance,
        purchases: updatedPurchases
      });

      return { success: true, message: "購入完了", newUser: { ...user, balance: newBalance, purchases: updatedPurchases } };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      return { success: false, message: "購入に失敗しました" };
    }
  },

  async updateUser(userId: string, data: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', userId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async updateUserBalance(userId: string, newBalance: number) {
    try {
      await updateDoc(doc(db, 'users', userId), { balance: newBalance });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async executeDraw(date: string, games: LotteryGame[]): Promise<AdminConfig> {
    try {
      const config = await this.getConfig();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(d => d.data() as User);
      
      let configChanged = false;
      const changedUserIds = new Set<string>();

      for (const game of games) {
        let drawResult = config.winningNumbers[game.id]?.[date];
        
        if (!drawResult) {
          drawResult = generateRandomNumbers(game.pickCount, game.maxNumber);
          if (!config.winningNumbers[game.id]) config.winningNumbers[game.id] = {};
          config.winningNumbers[game.id][date] = drawResult;
          configChanged = true;
        }

        for (const user of users) {
          let userChanged = false;
          for (const p of user.purchases) {
            if (p.gameId !== game.id) continue;

            // 计算彩票依据购买时间推算出的计划开奖日期
            const scheduledDrawDate = getTargetDrawDate(p.timestamp);
            
            // 只有当当前的开奖日期 date >= 彩票计划开奖日期 scheduledDrawDate 且已经到了日本时间 JST 早上 08:00 开奖派奖时间点，且该彩票为待开奖（!p.isProcessed），才允许进行开奖计算
            const isEligible = !p.isProcessed && scheduledDrawDate <= date && isDrawTimeReached(scheduledDrawDate);

            if (isEligible) {
              // 优先使用彩票计划开奖日期的开奖号码，若尚未生成则使用当前 date 的号码
              const targetWinningNums = config.winningNumbers[game.id]?.[scheduledDrawDate] || drawResult;

              let totalPrize = 0;
              let winningRanks: string[] = [];
              let hasWon = false;

              p.numbers.forEach(pickedNumsStr => {
                const pickedNums = pickedNumsStr.split(',').map(Number);
                const matchCount = pickedNums.filter(n => targetWinningNums.includes(n)).length;
                let prize = 0;
                let rank = "";
                
                const defaultPrizes: Record<string, Record<string, number>> = {
                  loto7: { rank1: 10000000, rank2: 100000, rank3: 1000, rank4: 500, rank5: 200, rank6: 100 },
                  loto6: { rank1: 2000000, rank2: 50000, rank3: 800, rank4: 300, rank5: 100 },
                  miniloto: { rank1: 1000000, rank2: 30000, rank3: 500, rank4: 200 }
                };
                
                const prizeSettings = {
                  ...(defaultPrizes[game.id] || { rank1: 10000000, rank2: 100000, rank3: 1000 }),
                  ...(config.prizeSettings?.[game.id] || {})
                };
                
                if (matchCount === game.pickCount) {
                  prize = prizeSettings.rank1 || 0;
                  rank = "rank_1";
                } else if (matchCount === game.pickCount - 1) {
                  prize = prizeSettings.rank2 || 0;
                  rank = "rank_2";
                } else if (matchCount === game.pickCount - 2) {
                  prize = prizeSettings.rank3 || 0;
                  rank = "rank_3";
                } else if (matchCount === game.pickCount - 3 && prizeSettings.rank4) {
                  prize = prizeSettings.rank4 || 0;
                  rank = "rank_4";
                } else if (matchCount === game.pickCount - 4 && prizeSettings.rank5) {
                  prize = prizeSettings.rank5 || 0;
                  rank = "rank_5";
                } else if (matchCount === game.pickCount - 5 && prizeSettings.rank6) {
                  prize = prizeSettings.rank6 || 0;
                  rank = "rank_6";
                }
                
                if (prize > 0) {
                  totalPrize += prize;
                  if (!winningRanks.includes(rank)) winningRanks.push(rank);
                  hasWon = true;
                }
              });

              if (hasWon) {
                const prevWinAmount = (p.status === 'won' && p.winAmount) ? p.winAmount : 0;
                p.status = 'won';
                p.winAmount = totalPrize;
                p.rank = winningRanks.join(', ');
                user.balance = user.balance - prevWinAmount + totalPrize;
              } else {
                p.status = 'lost';
                p.winAmount = 0;
                p.rank = '';
              }
              
              p.isProcessed = true;
              p.drawDate = scheduledDrawDate;
              userChanged = true;
            }
          }
          
          // 如果用户余额出现负数（此前误扣导致），自动矫正修复为正确余额
          if (user.balance < 0) {
            const wonTotal = user.purchases
              .filter(p => p.status === 'won' && p.winAmount)
              .reduce((sum, p) => sum + (p.winAmount || 0), 0);
            if (wonTotal > 0) {
              user.balance = Math.max(0, user.balance + wonTotal);
            } else {
              user.balance = Math.abs(user.balance);
            }
            userChanged = true;
          }

          if (userChanged) {
            changedUserIds.add(user.id);
          }
        }
      }

      // 执行批量提交以极大减少Firestore写入次数
      if (changedUserIds.size > 0 || configChanged) {
        const batch = writeBatch(db);
        
        if (configChanged) {
          batch.set(doc(db, 'config', 'global'), config);
        }

        for (const userId of changedUserIds) {
          const u = users.find(usr => usr.id === userId);
          if (u) {
            batch.update(doc(db, 'users', userId), {
              balance: u.balance,
              purchases: u.purchases
            });
          }
        }

        await batch.commit();
      }

      return config;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'draw_execution');
      throw error;
    }
  }
};
