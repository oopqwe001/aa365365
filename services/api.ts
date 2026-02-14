
import { User, Transaction, AdminConfig, Purchase, LotteryGame } from '../types';

const STORAGE_KEYS = {
  USER: 'lottery_active_user',
  ALL_USERS: 'lottery_all_users',
  TRANSACTIONS: 'lottery_transactions',
  CONFIG: 'lottery_admin_config'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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
    return saved ? JSON.parse(saved) : {
      lineLink: 'https://line.me/ti/p/service123',
      logoUrl: "", 
      winningNumbers: {
        loto7: { 
          '2024-05-22': [1, 5, 12, 18, 22, 29, 35],
          '2024-05-15': [2, 7, 10, 21, 25, 30, 32],
          '2024-05-08': [4, 8, 15, 19, 23, 28, 36]
        },
        loto6: { 
          '2024-05-22': [3, 9, 15, 21, 33, 41],
          '2024-05-19': [1, 5, 12, 18, 24, 40],
          '2024-05-16': [7, 11, 20, 29, 35, 42]
        },
        miniloto: { 
          '2024-05-22': [2, 8, 14, 20, 26],
          '2024-05-15': [5, 12, 18, 24, 30],
          '2024-05-08': [1, 7, 13, 19, 25]
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
    
    if (!user) {
        return { success: false, message: "ユーザーが見つかりません。" };
    }

    const validSelections = selections.filter(s => s.numbers.length > 0);
    const totalCost = validSelections.length * game.price;

    if (user.balance < totalCost) {
      return { success: false, message: "残高が不足しています。" };
    }

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

  async executeDraw(date: string, games: LotteryGame[]): Promise<{config: AdminConfig, users: User[]}> {
    const config = await this.getConfig();
    const users = await this.getAllUsers();
    const PRIZE_AMOUNTS: Record<string, number> = { 'loto7': 1200000000, 'loto6': 600000000, 'miniloto': 10000000 };

    games.forEach(game => {
      if (!config.winningNumbers[game.id]) config.winningNumbers[game.id] = {};
      if (!config.winningNumbers[game.id][date]) {
        const randomNums: number[] = [];
        while (randomNums.length < game.pickCount) {
          const r = Math.floor(Math.random() * game.maxNumber) + 1;
          if (!randomNums.includes(r)) randomNums.push(r);
        }
        config.winningNumbers[game.id][date] = randomNums.sort((a, b) => a - b);
      }
    });

    const updatedUsers = users.map(user => {
      let balanceAdded = 0;
      const updatedPurchases = user.purchases.map(purchase => {
        if (purchase.status !== 'pending') return purchase;
        const winNums = config.winningNumbers[purchase.gameId][date];
        if (!winNums) return purchase;
        
        let won = false;
        purchase.numbers.forEach(userNums => {
          const matches = userNums.filter(n => winNums.includes(n)).length;
          if (matches === winNums.length) won = true;
        });

        if (won) {
          const prize = PRIZE_AMOUNTS[purchase.gameId];
          balanceAdded += prize;
          return { ...purchase, status: 'won', isProcessed: true, winAmount: prize };
        }
        return { ...purchase, status: 'lost', isProcessed: true, winAmount: 0 };
      });
      return { ...user, balance: user.balance + balanceAdded, purchases: updatedPurchases };
    });

    await this.saveConfig(config);
    await this.saveAllUsers(updatedUsers);
    
    return { config, users: updatedUsers };
  }
};
