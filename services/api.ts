



import { User, Transaction, AdminConfig, Purchase, LotteryGame } from '../types';

const STORAGE_KEYS = {
  USER: 'lottery_active_user',
  ALL_USERS: 'lottery_all_users',
  TRANSACTIONS: 'lottery_transactions',
  CONFIG: 'lottery_admin_config'
};

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
    return { id: 'GUEST', username: 'ゲスト', isLoggedIn: false, balance: 0, bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' }, purchases: [] };
  },

  async saveActiveUser(user: User) { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); },

  async getAllUsers(): Promise<User[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return saved ? JSON.parse(saved) : [];
  },

  async saveAllUsers(users: User[]) { localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users)); },

  async register(email: string, pass: string, name: string): Promise<{success: boolean, message: string, user?: User}> {
    const users = await this.getAllUsers();
    if (users.some(u => u.email === email)) return { success: false, message: "登録済み" };
    const newUser: User = { id: 'U' + Date.now(), username: name, email, password: pass, isLoggedIn: true, balance: 0, bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' }, purchases: [] };
    users.push(newUser);
    await this.saveAllUsers(users);
    await this.saveActiveUser(newUser);
    return { success: true, message: "成功", user: newUser };
  },

  async login(email: string, pass: string): Promise<{success: boolean, message: string, user?: User}> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === pass);
    if (!user) return { success: false, message: "失敗" };
    const loggedIn = { ...user, isLoggedIn: true };
    await this.saveActiveUser(loggedIn);
    return { success: true, message: "成功", user: loggedIn };
  },

  async getTransactions(): Promise<Transaction[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  },

  async saveTransactions(txs: Transaction[]) { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs)); },

  async getConfig(): Promise<AdminConfig> {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    let config: AdminConfig;

    if (saved) {
      config = JSON.parse(saved);
      if (!config.prizeSettings) config.prizeSettings = { loto7: { tier1: 600000000, tier2: 10000000, tier3: 500000 }, loto6: { tier1: 200000000, tier2: 5000000, tier3: 200000 }, miniloto: { tier1: 10000000, tier2: 150000, tier3: 10000 } };
    } else {
      config = { 
        lineLink: '', 
        logoUrl: "", 
        winningNumbers: {}, 
        prizeSettings: { 
          loto7: { tier1: 600000000, tier2: 10000000, tier3: 500000 }, 
          loto6: { tier1: 200000000, tier2: 5000000, tier3: 200000 }, 
          miniloto: { tier1: 10000000, tier2: 150000, tier3: 10000 } 
        } 
      };
    }

    // 初始化模拟开奖数据 (如果没有记录的话)
    const games = [
      { id: 'loto7', pickCount: 7, maxNumber: 37 },
      { id: 'loto6', pickCount: 6, maxNumber: 43 },
      { id: 'miniloto', pickCount: 5, maxNumber: 31 }
    ];

    let hasChanges = false;
    games.forEach(g => {
      if (!config.winningNumbers[g.id] || Object.keys(config.winningNumbers[g.id]).length === 0) {
        config.winningNumbers[g.id] = {};
        // 为过去3天生成数据
        for (let i = 0; i < 3; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('sv-SE');
          config.winningNumbers[g.id][dateStr] = generateRandomNumbers(g.pickCount, g.maxNumber);
        }
        hasChanges = true;
      }
    });

    if (hasChanges || !saved) {
      await this.saveConfig(config);
    }

    return config;
  },

  async saveConfig(config: AdminConfig) { localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)); },

  async processPurchase(userId: string, game: LotteryGame, selections: any[]): Promise<{success: boolean, message: string, newUser?: User}> {
    const users = await this.getAllUsers();
    let user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "エラー" };
    const valid = selections.filter(s => s.numbers.length > 0);
    const cost = valid.length * game.price;
    if (user.balance < cost) return { success: false, message: "残高不足" };
    const newPurchase: Purchase = { id: 'P' + Math.random().toString(36).substr(2, 6).toUpperCase(), userId: user.id, gameId: game.id, numbers: valid.map(s => s.numbers), timestamp: Date.now(), isProcessed: false, status: 'pending', winAmount: 0 };
    user.balance -= cost;
    user.purchases.push(newPurchase);
    await this.saveAllUsers(users);
    await this.saveActiveUser(user);
    return { success: true, message: "成功", newUser: user };
  },

  async updatePurchaseTier(userId: string, purchaseId: string, tier: 1 | 2 | 3 | 0): Promise<boolean> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    const purchase = user.purchases.find(p => p.id === purchaseId);
    if (!purchase) return false;
    purchase.forcedWinTier = tier;
    await this.saveAllUsers(users);
    return true;
  },

  async executeDraw(date: string, games: LotteryGame[]): Promise<AdminConfig> {
    const config = await this.getConfig();
    const users = await this.getAllUsers();
    games.forEach(game => {
      let drawResult = config.winningNumbers[game.id]?.[date];
      if (!drawResult) {
        drawResult = generateRandomNumbers(game.pickCount, game.maxNumber);
        if (!config.winningNumbers[game.id]) config.winningNumbers[game.id] = {};
        config.winningNumbers[game.id][date] = drawResult;
      }
      const prizes = config.prizeSettings[game.id];
      users.forEach(user => {
        user.purchases.forEach(p => {
          if (p.gameId === game.id && !p.isProcessed) {
            if (p.forcedWinTier !== undefined && p.forcedWinTier > 0) {
              const prize = p.forcedWinTier === 1 ? prizes.tier1 : (p.forcedWinTier === 2 ? prizes.tier2 : prizes.tier3);
              p.status = 'won'; p.winAmount = prize; user.balance += prize;
            } else if (p.forcedWinTier === 0) {
              p.status = 'lost';
            } else {
              let maxP = 0;
              p.numbers.forEach(nums => {
                const matches = nums.filter(n => drawResult.includes(n)).length;
                let curP = matches === game.pickCount ? prizes.tier1 : (matches === game.pickCount - 1 ? prizes.tier2 : (matches === game.pickCount - 2 ? prizes.tier3 : 0));
                if (curP > maxP) maxP = curP;
              });
              if (maxP > 0) { p.status = 'won'; p.winAmount = maxP; user.balance += maxP; } else { p.status = 'lost'; }
            }
            p.isProcessed = true;
          }
        });
      });
    });
    await this.saveConfig(config);
    await this.saveAllUsers(users);
    const active = await this.getActiveUser();
    const updated = users.find(u => u.id === active.id);
    if (updated) await this.saveActiveUser({ ...updated, isLoggedIn: true });
    return config;
  },

  async predictLuckyNumbers(gameName: string, pickCount: number, maxNumber: number): Promise<number[]> {
    return generateRandomNumbers(pickCount, maxNumber);
  }
};


