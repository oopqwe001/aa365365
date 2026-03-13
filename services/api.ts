
import { User, Transaction, AdminConfig, Purchase, LotteryGame } from '../types';
import { db, auth } from '../firebase';
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
  Timestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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

export const lotteryApi = {
  async getActiveUser(): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return {
        id: 'GUEST',
        username: 'ゲスト',
        isLoggedIn: false,
        balance: 0,
        bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
        purchases: []
      };
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return { ...userDoc.data() as User, isLoggedIn: true };
      }
      return {
        id: currentUser.uid,
        username: currentUser.displayName || 'ユーザー',
        isLoggedIn: true,
        balance: 0,
        bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
        purchases: []
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(d => ({ ...d.data() as User, isLoggedIn: false }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      throw error;
    }
  },

  async register(email: string, pass: string, name: string): Promise<{success: boolean, message: string, user?: User}> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;
      
      const newUser: User = {
        id: uid,
        username: name,
        email: email,
        isLoggedIn: true,
        balance: 0,
        bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
        purchases: []
      };

      await setDoc(doc(db, 'users', uid), newUser);
      return { success: true, message: "登録成功", user: newUser };
    } catch (error: any) {
      return { success: false, message: error.message || "登録に失敗しました" };
    }
  },

  async login(email: string, pass: string): Promise<{success: boolean, message: string, user?: User}> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const user = userDoc.data() as User;
        return { success: true, message: "ログイン成功", user: { ...user, isLoggedIn: true } };
      } else {
        return { success: false, message: "ユーザーデータが見つかりません" };
      }
    } catch (error: any) {
      return { success: false, message: "メールアドレスまたはパスワードが正しくありません。" };
    }
  },

  async logout() {
    await signOut(auth);
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
      await updateDoc(txRef, { status });

      if (status === 'approved') {
        const userRef = doc(db, 'users', tx.userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const user = userDoc.data() as User;
          const newBalance = tx.type === 'deposit' ? user.balance + tx.amount : user.balance - tx.amount;
          await updateDoc(userRef, { balance: newBalance });
        }
      }
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

      const newPurchase: Purchase = {
        id: 'P' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        userId: user.id,
        gameId: game.id,
        numbers: validSelections.map(s => s.numbers),
        timestamp: Date.now(),
        isProcessed: false,
        status: 'pending',
        winAmount: 0
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
      
      games.forEach(game => {
        let drawResult = config.winningNumbers[game.id]?.[date];
        
        if (!drawResult) {
          drawResult = generateRandomNumbers(game.pickCount, game.maxNumber);
          if (!config.winningNumbers[game.id]) config.winningNumbers[game.id] = {};
          config.winningNumbers[game.id][date] = drawResult;
        }

        users.forEach(user => {
          let userChanged = false;
          user.purchases.forEach(p => {
            if (p.gameId === game.id && !p.isProcessed) {
              p.numbers.forEach(pickedNums => {
                const matchCount = pickedNums.filter(n => drawResult.includes(n)).length;
                let prize = 0;
                if (matchCount === game.pickCount) prize = 10000000;
                else if (matchCount === game.pickCount - 1) prize = 100000;
                
                if (prize > 0) {
                  p.status = 'won';
                  p.winAmount += prize;
                  user.balance += prize;
                } else {
                  p.status = 'lost';
                }
              });
              p.isProcessed = true;
              userChanged = true;
            }
          });
          
          if (userChanged) {
            updateDoc(doc(db, 'users', user.id), { 
              balance: user.balance,
              purchases: user.purchases
            });
          }
        });
      });

      await this.saveConfig(config);
      return config;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'draw_execution');
      throw error;
    }
  }
};


