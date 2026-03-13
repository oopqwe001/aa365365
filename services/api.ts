
import { User, Transaction, AdminConfig, Purchase, LotteryGame } from '../types';

const STORAGE_KEYS = {
  USER: 'lottery_active_user',
  ALL_USERS: 'lottery_all_users',
  TRANSACTIONS: 'lottery_transactions',
  CONFIG: 'lottery_admin_config'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// 生成不重复的随机数数组
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
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
    
    return {
      id: 'GUEST',
      username: 'ゲスト',
      isLoggedIn: false,
      balance: 0,
      bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
      purchases: []
    };
  },

  async saveActiveUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async getAllUsers(): Promise<User[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return saved ? JSON.parse(saved) : [];
  },

  async saveAllUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  },

  async register(email: string, pass: string, name: string): Promise<{success: boolean, message: string, user?: User}> {
    await delay(800);
    const users = await this.getAllUsers();
    
    if (users.some(u => u.email === email)) {
      return { success: false, message: "このメールアドレスは既に登録されています。" };
    }

    const newUser: User = {
      id: 'U' + Math.floor(Math.random() * 90000 + 10000),
      username: name,
      email: email,
      password: pass,
      isLoggedIn: true,
      balance: 0,
      bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
      purchases: []
    };

    users.push(newUser);
    await this.saveAllUsers(users);
    await this.saveActiveUser(newUser);
    
    return { success: true, message: "登録成功", user: newUser };
  },

  async login(email: string, pass: string): Promise<{success: boolean, message: string, user?: User}> {
    await delay(800);
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === pass);

    if (!user) {
      return { success: false, message: "メールアドレスまたはパスワードが正しくありません。" };
    }

    const loggedInUser = { ...user, isLoggedIn: true };
    await this.saveActiveUser(loggedInUser);
    
    return { success: true, message: "ログイン成功", user: loggedInUser };
  },

  async getTransactions(): Promise<Transaction[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  },

  async saveTransactions(txs: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  },

  async getConfig(): Promise<AdminConfig> {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) return JSON.parse(saved);

    return {
      lineLink: 'https://line.me/ti/p/service123',
      logoUrl: "", 
      winningNumbers: {
        loto7: { 
          '2026-03-10': [2, 7, 11, 19, 23, 30, 36],
          '2026-03-09': [4, 8, 15, 21, 25, 31, 37]
        },
        loto6: { 
          '2026-03-10': [5, 12, 18, 24, 35, 42],
          '2026-03-09': [1, 9, 16, 22, 33, 40]
        },
        miniloto: { 
          '2026-03-10': [3, 10, 17, 24, 31],
          '2026-03-09': [6, 13, 20, 27, 29]
        }
      }
    };
  },

  async saveConfig(config: AdminConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  async processPurchase(userId: string, game: LotteryGame, selections: any[]): Promise<{success: boolean, message: string, newUser?: User}> {
    await delay(500);
    const users = await this.getAllUsers();
    let user = users.find(u => u.id === userId);
    
    if (!user) return { success: false, message: "ユーザーが見つかりません。" };

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

    user.balance -= totalCost;
    user.purchases.push(newPurchase);

    await this.saveAllUsers(users);
    await this.saveActiveUser(user);
    return { success: true, message: "購入完了", newUser: user };
  },

  async executeDraw(date: string, games: LotteryGame[]): Promise<AdminConfig> {
    const config = await this.getConfig();
    const users = await this.getAllUsers();
    
    games.forEach(game => {
      // 如果配置中已经有该日期的号码（手动预设），则直接使用，不重新生成
      let drawResult = config.winningNumbers[game.id]?.[date];
      
      if (!drawResult) {
        // 如果没有预设，则随机生成
        drawResult = generateRandomNumbers(game.pickCount, game.maxNumber);
        if (!config.winningNumbers[game.id]) config.winningNumbers[game.id] = {};
        config.winningNumbers[game.id][date] = drawResult;
      }

      // 派奖逻辑
      users.forEach(user => {
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
          }
        });
      });
    });

    await this.saveConfig(config);
    await this.saveAllUsers(users);
    
    const activeUser = await this.getActiveUser();
    const updatedActive = users.find(u => u.id === activeUser.id);
    if (updatedActive) await this.saveActiveUser(updatedActive);

    return config;
  }
};

