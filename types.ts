
export type AppView = 'home' | 'summary' | 'picker' | 'history' | 'mypage' | 'admin' | 'withdraw' | 'deposit' | 'transactions' | 'login' | 'register';

export interface BankInfo {
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountName: string; 
}

export interface User {
  id: string;
  username: string;
  email?: string;
  password?: string;
  isLoggedIn: boolean;
  balance: number;
  bankInfo: BankInfo;
  purchases: Purchase[];
}

export interface Purchase {
  id: string;
  userId: string;
  gameId: string;
  numbers: number[][];
  timestamp: number;
  isProcessed: boolean;
  status: 'pending' | 'won' | 'lost';
  winAmount: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  bankDetails?: BankInfo; 
}

export interface AdminConfig {
  lineLink: string;
  logoUrl: string;
  winningNumbers: {
    [gameId: string]: {
      [date: string]: number[];
    }
  };
}

export interface LotteryGame {
  id: string;
  name: string;
  fullName: string;
  drawDayText: string;
  drawDayIcon: string;
  maxJackpot: string;
  price: number;
  maxNumber: number;
  pickCount: number;
  color: string;
  colorSecondary: string;
}

export interface Selection {
  id: string; 
  numbers: number[];
  count: number;
  duration: number;
}
