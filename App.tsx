


import React, { useState, useEffect } from 'react';
import { AppView, LotteryGame, Selection, User, AdminConfig, Purchase, Transaction } from './types';
import { lotteryApi } from './services/api';
import GameList from './components/GameList';
import SummaryView from './components/SummaryView';
import NumberPicker from './components/NumberPicker';
import MyPage from './components/MyPage';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
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
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);

  const [selectedGame, setSelectedGame] = useState<LotteryGame>(GAMES[0]);
  const [selections, setSelections] = useState<Selection[]>(['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 })));
  const [activeSelectionId, setActiveSelectionId] = useState<string>('A');

  const refreshData = async () => {
    try {
      const user = await lotteryApi.getActiveUser();
      const config = await lotteryApi.getConfig();
      const txs = await lotteryApi.getTransactions();
      const users = await lotteryApi.getAllUsers();
      
      setActiveUser(user); 
      setAdminConfig(config); 
      setTransactions(txs); 
      setAllUsers(users.length ? users : [user]);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        // 通过 URL 进入时也要求输入口令
        const code = window.prompt("管理コードを入力してください (Default: 8888)");
        if (code === '8888') {
          setView('admin');
        } else {
          alert("認証に失敗しました");
          setView('home');
        }
        // 清除 URL 参数防止刷新时重复弹窗
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (e) {
      console.error("Data refresh failed", e);
    }
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

  const handleDeposit = async (amount: number) => {
    if (!activeUser) return;
    const newTx: Transaction = {
      id: 'TX' + Date.now(),
      userId: activeUser.id,
      type: 'deposit',
      amount,
      status: 'pending',
      timestamp: Date.now()
    };
    const updated = [...transactions, newTx];
    await lotteryApi.saveTransactions(updated);
    await refreshData();
    setView('transactions');
  };

  const handleWithdraw = async (data: any) => {
    if (!activeUser) return;
    if (activeUser.balance < data.amount) {
      alert("残高が不足しています。");
      return;
    }
    const newTx: Transaction = {
      id: 'TX' + Date.now(),
      userId: activeUser.id,
      type: 'withdraw',
      amount: data.amount,
      status: 'pending',
      timestamp: Date.now(),
      bankDetails: {
        bankName: data.bankName,
        branchName: data.branchName,
        accountNumber: data.accountNumber,
        accountName: data.nameKana
      }
    };
    const updated = [...transactions, newTx];
    await lotteryApi.saveTransactions(updated);
    await refreshData();
    setView('transactions');
  };

  if (!activeUser || !adminConfig) return null;

  return (
    <div className="flex justify-center bg-[#f2f2f2] min-h-screen">
      <div className="w-full max-w-[390px] bg-white relative flex flex-col shadow-2xl">
        {view !== 'admin' && (
          <Navbar 
            user={activeUser} view={view} logoUrl={adminConfig.logoUrl} 
            onLoginView={() => setView('login')} onRegisterView={() => setView('register')}
            onAdmin={() => {
               const code = window.prompt("管理コードを入力してください");
               if (code === '8888') setView('admin');
               else if (code !== null) alert("認証失敗");
            }} 
            onBack={() => setView('home')} 
          />
        )}
        <main className="flex-1 pb-20 overflow-y-auto">
          {view === 'home' && (
            <>
              <GameList games={GAMES} onBuy={(g) => { setSelectedGame(g); setView('summary'); }} onShowHistory={() => setView('history')} winningNumbers={adminConfig.winningNumbers} />
              <div className="px-6 py-10 text-center opacity-30 select-none">
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                  本サイトはシミュレーション用であり、<br/>
                  実際の金銭のやり取りや賭博行為は一切行われません。<br/>
                  © 2024 LOTO Simulation Lab.
                </p>
              </div>
            </>
          )}
          {view === 'summary' && <SummaryView game={selectedGame} selections={selections} onBack={() => setView('home')} onSelect={(id) => { setActiveSelectionId(id); setView('picker'); }} onQuickPick={(id) => { const nums: number[] = []; while(nums.length < selectedGame.pickCount) { const r = Math.floor(Math.random() * selectedGame.maxNumber) + 1; if(!nums.includes(r)) nums.push(r); } setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: nums.sort((a,b)=>a-b) } : s)); }} onDelete={(id) => setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: [] } : s))} onFinalize={async () => { if(!activeUser.isLoggedIn) { setView('login'); return; } await lotteryApi.processPurchase(activeUser.id, selectedGame, selections); await refreshData(); setView('home'); }} />}
          {view === 'picker' && <NumberPicker game={selectedGame} selectionId={activeSelectionId} initialNumbers={selections.find(s => s.id === activeSelectionId)?.numbers || []} onCancel={() => setView('summary')} onComplete={(nums) => { setSelections(prev => prev.map(s => s.id === activeSelectionId ? { ...s, numbers: nums } : s)); setView('summary'); }} />}
          {view === 'history' && <DrawHistory games={GAMES} history={adminConfig.winningNumbers} onBack={() => setView('home')} />}
          {view === 'mypage' && <MyPage user={activeUser} onAction={(v) => setView(v)} onLogout={() => { setActiveUser({...activeUser, isLoggedIn: false}); setView('home'); }} />}
          {view === 'deposit' && <DepositView onBack={() => setView('mypage')} onSubmit={handleDeposit} />}
          {view === 'withdraw' && <WithdrawForm onBack={() => setView('mypage')} onSubmit={handleWithdraw} />}
          {view === 'transactions' && <TransactionHistory userId={activeUser.id} transactions={transactions} onBack={() => setView('mypage')} />}
          {view === 'admin' && <AdminPanel games={GAMES} config={adminConfig} setConfig={(c) => { setAdminConfig(c); lotteryApi.saveConfig(c); }} onBack={() => setView('home')} users={allUsers} transactions={transactions} onProcessTx={handleProcessTx} onUpdateUser={handleUpdateUser} onExecuteDraw={async (d) => { await lotteryApi.executeDraw(d, GAMES); await refreshData(); }} />}
          {view === 'login' && <LoginView onBack={() => setView('home')} onSuccess={async (e, p) => { const res = await lotteryApi.login(e, p); if(res.success) { await refreshData(); setView('home'); } else { alert('ログインに失败しました'); } }} onGoToRegister={() => setView('register')} />}
          {view === 'register' && <RegisterView onBack={() => setView('home')} onSuccess={async (d) => { await lotteryApi.register(d.email, d.password, d.username); await refreshData(); setView('home'); }} />}
        </main>
        {view !== 'admin' && (
          <nav className="fixed bottom-0 w-full max-w-[390px] bg-white flex justify-around items-center h-16 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-t border-gray-100 z-50">
            <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'home' ? 'text-red-600' : 'text-gray-400'}`}><i className="fas fa-home text-lg"></i><span className="text-[9px] font-black">ホーム</span></button>
            <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'history' ? 'text-red-600' : 'text-gray-400'}`}><i className="fas fa-trophy text-lg"></i><span className="text-[9px] font-black">当せん結果</span></button>
            <button onClick={() => { if(activeUser.isLoggedIn) setView('mypage'); else setView('login'); }} className={`flex flex-col items-center gap-1 transition-colors ${view === 'mypage' ? 'text-red-600' : 'text-gray-400'}`}><i className="fas fa-user text-lg"></i><span className="text-[9px] font-black">マイページ</span></button>
          </nav>
        )}
      </div>
    </div>
  );
};
export default App;



