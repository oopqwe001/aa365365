
export type AppView = 'home' | 'summary' | 'picker' | 'history' | 'mypage' | 'admin' | 'withdraw' | 'deposit' | 'transactions' | 'login' | 'register' | 'purchases' | 'share-win';

export interface BankInfo {
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountName: string; 
}

export interface User {
  id: string;
  displayId?: string;
  username: string;
  email?: string;
  password?: string;
  isLoggedIn: boolean;
  balance: number;
  role?: 'admin' | 'user';
  bankInfo: BankInfo;
  purchases: Purchase[];
}

export interface Purchase {
  id: string;
  userId: string;
  gameId: string;
  numbers: string[]; // Array of comma-separated number strings to avoid Firestore nested array error
  timestamp: number;
  isProcessed: boolean;
  status: 'pending' | 'won' | 'lost';
  winAmount: number;
  rank?: string; // e.g. "1等", "2等", "3等"
  drawDate?: string; // YYYY-MM-DD
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

export interface PrizeSettings {
  [gameId: string]: {
    rank1: number;
    rank2: number;
    rank3: number;
    rank4?: number;
    rank5?: number;
    rank6?: number;
  }
}

export interface AdminConfig {
  lineLink: string;
  logoUrl: string;
  winningNumbers: {
    [gameId: string]: {
      [date: string]: number[];
    }
  };
  prizeSettings?: PrizeSettings;
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
