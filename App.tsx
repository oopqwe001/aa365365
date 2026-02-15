
import React, { useState, useEffect } from 'react';
import { AppView, LotteryGame, Selection, User, AdminConfig, Purchase, Transaction } from './types';
import { lotteryApi } from './services/api';
import GameList from './components/GameList';
import SummaryView from './components/SummaryView';
import NumberPicker from './components/NumberPicker';
import MyPage from './components/MyPage';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import CustomerService from './components/CustomerService';
import DrawHistory from './components/DrawHistory';
import WithdrawForm from './components/WithdrawForm';
import DepositView from './components/DepositView';
import TransactionHistory from './components/TransactionHistory';
import RegisterView from './components/RegisterView';
import LoginView from './components/LoginView';

const GAMES: LotteryGame[] = [
  { id: 'loto7', name: 'LOTO 7', fullName: 'ロトセブン', drawDayText: '毎日', drawDayIcon: '全', maxJackpot: '12億円', price: 300, maxNumber: 37, pickCount: 7, color: '#e60012', colorSecondary: '#005bac' },
  { id: 'loto6', name: 'LOTO 6', fullName: 'ロトシックス', drawDayText: '毎日', drawDayIcon: '全', maxJackpot: '6億円', price: 200, maxNumber: 43, pickCount: 6, color: '#d81b60', colorSecondary: '#f08300' },
  { id: 'miniloto', name: 'MINI LOTO', fullName: 'ミニロト', drawDayText: '毎日', drawDayIcon: '全', maxJackpot: '1,000万円', price: 200, maxNumber: 31, pickCount: 5, color: '#009b4f', colorSecondary: '#f08300' }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);

  const [selectedGame, setSelectedGame] = useState<LotteryGame>(GAMES[0]);
  const [selections, setSelections] = useState<Selection[]>(['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 })));
  const [activeSelectionId, setActiveSelectionId] = useState<string>('A');

  const refreshData = async () => {
    const user = await lotteryApi.getActiveUser();
    const config = await lotteryApi.getConfig();
    const txs = await lotteryApi.getTransactions();
    const users = await lotteryApi.getAllUsers();
    setActiveUser(user); setAdminConfig(config); setTransactions(txs); setAllUsers(users.length ? users : [user]);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') setView('admin');
  };

  useEffect(() => { refreshData(); }, []);

  const handleUpdateUser = async (uid: string, data: any) => {
    const users = await lotteryApi.getAllUsers();
    const updatedUsers = users.map(u => u.id === uid ? { ...u, ...data } : u);
    await lotteryApi.saveAllUsers(updatedUsers);
    if (activeUser?.id === uid) {
      const updatedActive = { ...activeUser, ...data };
      setActiveUser(updatedActive);
      await lotteryApi.saveActiveUser(updatedActive);
    }
    await refreshData();
  };

  const handleProcessTx = async (id: string, status: 'approved' | 'rejected') => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    if (status === 'approved') {
      const users = await lotteryApi.getAllUsers();
      const user = users.find(u => u.id === tx.userId);
      if (user) {
        if (tx.type === 'deposit') user.balance += tx.amount;
        else if (tx.type === 'withdraw') user.balance -= tx.amount;
        await lotteryApi.saveAllUsers(users);
      }
    }
    const updatedTxs = transactions.map(t => t.id === id ? { ...t, status } : t);
    await lotteryApi.saveTransactions(updatedTxs);
    await refreshData();
  };

  if (!activeUser || !adminConfig) return null;

  return (
    <div className="flex justify-center bg-[#f2f2f2] min-h-screen">
      <div className="w-full max-w-[390px] bg-white relative flex flex-col shadow-2xl">
        {view !== 'admin' && (
          <Navbar 
            user={activeUser} view={view} logoUrl={adminConfig.logoUrl} 
            onLoginView={() => setView('login')} onRegisterView={() => setView('register')}
            onAdmin={() => setView('admin')} onBack={() => setView('home')} 
          />
        )}
        <main className="flex-1 pb-20 overflow-y-auto">
          {view === 'home' && <GameList games={GAMES} onBuy={(g) => { setSelectedGame(g); setView('summary'); }} onShowHistory={() => setView('history')} winningNumbers={adminConfig.winningNumbers} />}
          {view === 'summary' && <SummaryView game={selectedGame} selections={selections} onBack={() => setView('home')} onSelect={(id) => { setActiveSelectionId(id); setView('picker'); }} onQuickPick={(id) => { const nums: number[] = []; while(nums.length < selectedGame.pickCount) { const r = Math.floor(Math.random() * selectedGame.maxNumber) + 1; if(!nums.includes(r)) nums.push(r); } setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: nums.sort((a,b)=>a-b) } : s)); }} onDelete={(id) => setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: [] } : s))} onFinalize={async () => { await lotteryApi.processPurchase(activeUser.id, selectedGame, selections); await refreshData(); setView('home'); }} />}
          {view === 'picker' && <NumberPicker game={selectedGame} selectionId={activeSelectionId} initialNumbers={selections.find(s => s.id === activeSelectionId)?.numbers || []} onCancel={() => setView('summary')} onComplete={(nums) => { setSelections(prev => prev.map(s => s.id === activeSelectionId ? { ...s, numbers: nums } : s)); setView('summary'); }} />}
          {view === 'mypage' && <MyPage user={activeUser} onAction={(v) => setView(v)} onLogout={() => { /* Logout Logic */ }} />}
          {view === 'admin' && <AdminPanel config={adminConfig} setConfig={(c) => { setAdminConfig(c); lotteryApi.saveConfig(c); }} onBack={() => setView('home')} users={allUsers} transactions={transactions} onProcessTx={handleProcessTx} onUpdateUser={handleUpdateUser} onExecuteDraw={async (d) => { await lotteryApi.executeDraw(d, GAMES); await refreshData(); }} />}
          {view === 'login' && <LoginView onBack={() => setView('home')} onSuccess={async (e, p) => { await lotteryApi.login(e, p); await refreshData(); setView('home'); }} onGoToRegister={() => setView('register')} />}
          {view === 'register' && <RegisterView onBack={() => setView('home')} onSuccess={async (d) => { await lotteryApi.register(d.email, d.password, d.username); await refreshData(); setView('home'); }} />}
        </main>
        {view !== 'admin' && (
          <nav className="fixed bottom-0 w-full max-w-[390px] bg-white flex justify-around items-center h-16 shadow-lg border-t">
            <button onClick={() => setView('home')} className={`flex flex-col items-center ${view === 'home' ? 'text-red-600' : 'text-gray-400'}`}><i className="fas fa-home"></i><span className="text-[10px]">ホーム</span></button>
            <button onClick={() => setView('history')} className={`flex flex-col items-center ${view === 'history' ? 'text-red-600' : 'text-gray-400'}`}><i className="fas fa-trophy"></i><span className="text-[10px]">結果</span></button>
            <button onClick={() => setView('mypage')} className={`flex flex-col items-center ${view === 'mypage' ? 'text-red-600' : 'text-gray-400'}`}><i className="fas fa-user"></i><span className="text-[10px]">マイ</span></button>
          </nav>
        )}
      </div>
    </div>
  );
};
export default App;

