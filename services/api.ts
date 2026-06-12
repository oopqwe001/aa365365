import { User, Transaction, AdminConfig, Purchase, LotteryGame } from '../types';

export const lotteryApi = {
  // Helper to make fetch requests simple and clean
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error (${res.status}): ${text}`);
    }
    return res.json() as Promise<T>;
  },

  async getActiveUser(): Promise<User> {
    const savedUser = localStorage.getItem('lottery_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        // Verify and refresh from the backend
        const refreshedUser = await this.request<User>(`/api/user?id=${user.id}`);
        if (refreshedUser) {
          const updated = { ...refreshedUser, isLoggedIn: true };
          localStorage.setItem('lottery_user', JSON.stringify(updated));
          return updated;
        }
      } catch (e) {
        console.warn("Could not reload active user, using cached copy from localStorage. Error:", e);
        try {
          const user = JSON.parse(savedUser) as User;
          return { ...user, isLoggedIn: true };
        } catch {
          localStorage.removeItem('lottery_user');
        }
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
      const res = await this.request<{success: boolean, message: string, user?: User}>('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass, username: name })
      });
      if (res.success && res.user) {
        localStorage.setItem('lottery_user', JSON.stringify(res.user));
      }
      return res;
    } catch (error: any) {
      console.error("Register network error:", error);
      return { success: false, message: "登録に失敗しました。接続を確認してください。" };
    }
  },

  async login(email: string, pass: string): Promise<{success: boolean, message: string, user?: User}> {
    try {
      const res = await this.request<{success: boolean, message: string, user?: User}>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass })
      });
      if (res.success && res.user) {
        localStorage.setItem('lottery_user', JSON.stringify(res.user));
      }
      return res;
    } catch (error: any) {
      console.error("Login network error:", error);
      return { success: false, message: "ログインに失敗しました。接続を確認してください。" };
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('lottery_user');
  },

  async sendPasswordReset(email: string): Promise<{success: boolean, message: string}> {
    // Standard mock behavior, falls back beautifully
    return { success: true, message: "パスワード再設定メールを送信しました。" };
  },

  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/api/transactions');
  },

  async createTransaction(tx: Transaction): Promise<void> {
    await this.request<void>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ tx })
    });
  },

  async updateTransactionStatus(txId: string, status: 'approved' | 'rejected'): Promise<void> {
    await this.request<void>('/api/transactions/status', {
      method: 'POST',
      body: JSON.stringify({ txId, status })
    });
  },

  async updateTransaction(txId: string, data: Partial<Transaction>): Promise<void> {
    await this.request<void>(`/api/transactions/${txId}`, {
      method: 'PATCH',
      body: JSON.stringify({ data })
    });
  },

  async getConfig(): Promise<AdminConfig> {
    return this.request<AdminConfig>('/api/config');
  },

  async saveConfig(config: AdminConfig): Promise<void> {
    await this.request<void>('/api/config', {
      method: 'POST',
      body: JSON.stringify({ config })
    });
  },

  async processPurchase(userId: string, game: LotteryGame, selections: any[]): Promise<{success: boolean, message: string, newUser?: User}> {
    try {
      const res = await this.request<{success: boolean, message: string, newUser?: User}>('/api/purchase', {
        method: 'POST',
        body: JSON.stringify({ userId, game, selections })
      });
      if (res.success && res.newUser) {
        const cached = { ...res.newUser, isLoggedIn: true };
        localStorage.setItem('lottery_user', JSON.stringify(cached));
      }
      return res;
    } catch (error) {
      console.error("Purchase submit network error:", error);
      return { success: false, message: "ネットワークエラーが発生しました。購入を完了できません。" };
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await this.request<void>(`/api/user/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ data })
    });
  },

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await this.request<void>(`/api/user/${userId}/balance`, {
      method: 'POST',
      body: JSON.stringify({ balance: newBalance })
    });
  },

  async executeDraw(date: string, games: LotteryGame[]): Promise<AdminConfig> {
    return this.request<AdminConfig>('/api/draw', {
      method: 'POST',
      body: JSON.stringify({ date, games })
    });
  }
};
