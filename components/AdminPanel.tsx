
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminConfig, User, Transaction, LotteryGame } from '../types';

interface Props {
  config: AdminConfig;
  setConfig: (config: AdminConfig) => void;
  onBack: () => void;
  users: User[];
  transactions: Transaction[];
  games: LotteryGame[];
  onProcessTx: (id: string, status: 'approved' | 'rejected') => void;
  onUpdateUser: (uid: string, data: any) => void;
  onExecuteDraw: (date: string) => void;
}

const AdminPanel: React.FC<Props> = ({ config, setConfig, onBack, users, transactions, games, onProcessTx, onUpdateUser, onExecuteDraw }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'dashboard' | 'users' | 'finance' | 'lottery' | 'system' | 'purchases'>('dashboard');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Calculate stats
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const pendingDeposits = transactions.filter(t => t.status === 'pending' && t.type === 'deposit');
  const pendingWithdrawals = transactions.filter(t => t.status === 'pending' && t.type === 'withdraw');
  const totalPurchases = users.reduce((sum, u) => sum + u.purchases.length, 0);

  const [editBalance, setEditBalance] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editBankName, setEditBankName] = useState<string>('');
  const [editAccountName, setEditAccountName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditing = (u: User) => {
    setEditingUser(u);
    setEditBalance(u.balance.toString());
    setEditUsername(u.username || '');
    setEditEmail(u.email || '');
    setEditPassword(u.password || '');
    setEditBankName(u.bankInfo.bankName || '');
    setEditAccountName(u.bankInfo.accountName || '');
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    onUpdateUser(editingUser.id, {
      balance: Number(editBalance),
      username: editUsername,
      email: editEmail,
      password: editPassword,
      bankInfo: {
        ...editingUser.bankInfo,
        bankName: editBankName,
        accountName: editAccountName
      }
    });
    setEditingUser(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetLogo = () => {
    setConfig({ ...config, logoUrl: "https://www.takarakuji-official.jp/assets/img/common/logo.svg" });
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[100] text-slate-800 overflow-hidden flex flex-col font-sans">
      <header className="bg-white p-4 flex justify-between items-center border-b border-slate-200 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-desktop text-sm text-white"></i>
          </div>
          {t('admin.title')} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-normal text-slate-500">V2.4 Pro</span>
        </h2>
        <button onClick={onBack} className="bg-slate-50 border border-slate-200 px-5 py-1.5 rounded-full text-xs font-bold hover:bg-slate-100 transition-all text-slate-600">
          {t('admin.exit')}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边导航 */}
        <aside className="w-52 bg-white border-r border-slate-200 p-3 flex flex-col justify-between">
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: t('admin.dashboard'), icon: 'fa-chart-line', color: 'text-blue-500' },
              { id: 'lottery', label: t('admin.lottery_mgmt'), icon: 'fa-bullhorn', color: 'text-orange-500' },
              { id: 'finance', label: t('admin.finance_mgmt'), icon: 'fa-shield-check', color: 'text-emerald-500' },
              { id: 'purchases', label: t('admin.purchase_records'), icon: 'fa-ticket-alt', color: 'text-rose-500' },
              { id: 'users', label: t('admin.user_mgmt'), icon: 'fa-user-group', color: 'text-indigo-500' },
              { id: 'system', label: t('admin.system_settings'), icon: 'fa-cog', color: 'text-purple-500' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-[13px] font-bold flex items-center gap-3 transition-all ${tab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-slate-50 text-slate-500'}`}
              >
                <i className={`fas ${item.icon} ${tab === item.id ? 'text-white' : item.color} text-base`}></i> {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">{t('admin.server_status')}</div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600">{t('admin.running')}</span>
             </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-1">{t('admin.total_users')}</div>
                  <div className="text-2xl font-black text-slate-900">{users.length} <span className="text-xs font-normal text-slate-400">人</span></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-1">{t('admin.total_balance')}</div>
                  <div className="text-2xl font-black text-emerald-600">¥ {totalBalance.toLocaleString()}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-1">{t('admin.pending_deposits')}</div>
                  <div className="text-2xl font-black text-orange-500">{pendingDeposits.length} <span className="text-xs font-normal text-slate-400">件</span></div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-slate-400 text-[10px] font-black uppercase mb-1">{t('admin.pending_withdrawals')}</div>
                  <div className="text-2xl font-black text-rose-500">{pendingWithdrawals.length} <span className="text-xs font-normal text-slate-400">件</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-slate-900 font-black mb-4 flex items-center gap-2">
                    <i className="fas fa-history text-blue-500"></i> {t('admin.recent_transactions')}
                  </h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{tx.type === 'deposit' ? t('common.deposit') : t('common.withdraw')} - ¥{tx.amount.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${tx.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : tx.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-rose-100 text-rose-600'}`}>
                          {tx.status === 'approved' ? t('admin.drawn') : tx.status === 'pending' ? t('admin.waiting') : t('admin.reject')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-slate-900 font-black mb-4 flex items-center gap-2">
                    <i className="fas fa-users text-indigo-500"></i> {t('admin.new_registrations')}
                  </h3>
                  <div className="space-y-3">
                    {users.slice(-5).reverse().map(u => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center font-black text-slate-600 text-xs">{u.username.charAt(0)}</div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{u.username}</div>
                            <div className="text-[10px] text-slate-400">{u.email}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-emerald-600">¥ {u.balance.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'lottery' && (
            <div className="max-w-4xl space-y-6">
              {/* 自动化开奖模块 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-slate-900 font-black text-base flex items-center gap-2">
                      <i className="fas fa-bolt text-orange-500"></i> {t('admin.execute_draw')}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      {t('admin.execute_draw_desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <input type="date" className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500/20" defaultValue={new Date().toISOString().split('T')[0]} id="exec-date" />
                   <button 
                    onClick={() => {
                      const dateVal = (document.getElementById('exec-date') as HTMLInputElement).value;
                      onExecuteDraw(dateVal);
                    }}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-black text-sm hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2"
                   >
                     <i className="fas fa-play"></i> {t('admin.execute_draw')}
                   </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-900 font-black text-base flex items-center gap-2">
                    <i className="fas fa-edit text-blue-500"></i> {t('admin.preset_numbers')}
                  </h3>
                  <span className="text-xs text-slate-400 italic">{t('admin.auto_update_notice')}</span>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-2 uppercase">{t('admin.game_type')}</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500/20">
                      <option>LOTO 7</option>
                      <option>LOTO 6</option>
                      <option>MINI LOTO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-2 uppercase">{t('admin.effective_date')}</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500/20" defaultValue="2024-05-23" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-bold mb-2 uppercase">{t('admin.bet_numbers')}</label>
                  <input type="text" placeholder={t('admin.winning_numbers_placeholder')} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-base font-black tracking-widest text-blue-600 outline-none focus:ring-2 ring-blue-500/20" />
                </div>
                <button className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                  {t('admin.save_preset')}
                </button>
              </div>
            </div>
          )}

          {tab === 'finance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="text-slate-900 font-black text-base">{t('admin.pending_requests')}</h3>
                 <span className="text-xs font-bold text-slate-400">{t('admin.total_bets', { count: transactions.filter(t => t.status === 'pending').length })}</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {transactions.filter(t => t.status === 'pending').map(tx => (
                  <div key={tx.id} className="bg-white rounded-2xl p-5 border border-slate-200 flex justify-between items-center group hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${tx.type === 'deposit' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                            {tx.type === 'deposit' ? t('common.deposit') : t('common.withdraw')}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">{t('admin.member_id')}: {tx.userId}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-xl font-black text-slate-900">¥ {tx.amount.toLocaleString()}</div>
                        {tx.bankDetails && (
                          <div className="mt-3 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-600">
                             <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div><span className="text-slate-400">{t('finance.bank_name')}:</span> {tx.bankDetails.bankName}</div>
                                <div><span className="text-slate-400">{t('finance.branch_name')}:</span> {tx.bankDetails.branchName}</div>
                                <div><span className="text-slate-400">{t('finance.account_number')}:</span> {tx.bankDetails.accountNumber}</div>
                                <div><span className="text-slate-400">{t('finance.account_name')}:</span> {tx.bankDetails.accountName}</div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onProcessTx(tx.id, 'rejected')} className="bg-rose-50 text-rose-600 border border-rose-100 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-rose-100 transition-all">{t('admin.reject')}</button>
                      <button onClick={() => onProcessTx(tx.id, 'approved')} className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">{t('admin.approve_and_credit')}</button>
                    </div>
                  </div>
                ))}

                {transactions.filter(t => t.status === 'pending').length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center opacity-20 text-slate-400">
                      <i className="fas fa-check-circle text-6xl mb-4"></i>
                      <p className="font-bold">{t('admin.no_pending')}</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {tab === 'purchases' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-slate-900 font-black text-base">{t('admin.all_purchase_records')}</h3>
                <div className="text-xs font-bold text-slate-400">
                  {t('admin.total_bets', { count: users.reduce((sum, u) => sum + u.purchases.length, 0) })}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 text-slate-400 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-black">{t('admin.user_time')}</th>
                      <th className="px-6 py-4 font-black">{t('admin.game_type')}</th>
                      <th className="px-6 py-4 font-black">{t('admin.bet_numbers')}</th>
                      <th className="px-6 py-4 font-black">{t('admin.status_prize')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.flatMap(u => u.purchases.map(p => ({ ...p, username: u.username }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((p, idx) => {
                      const game = games.find(g => g.id === p.gameId);
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-slate-900 font-black">{p.username}</div>
                            <div className="text-slate-400 text-[10px]">{new Date(p.timestamp).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-slate-700 font-bold">{game?.name || 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                              {p.numbers.map((numStr, nIdx) => (
                                <div key={nIdx} className="flex flex-wrap gap-1 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-100 w-full">
                                  {numStr.split(',').map((n, i) => (
                                    <span key={i} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                                      {n}
                                    </span>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded w-fit ${p.isProcessed ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                {p.isProcessed ? t('admin.drawn') : t('admin.waiting')}
                              </span>
                              {p.winAmount > 0 && (
                                <span className="text-emerald-600 font-black">{t('admin.won')}: ¥{p.winAmount.toLocaleString()}</span>
                              )}
                              {p.isProcessed && p.winAmount === 0 && (
                                <span className="text-slate-400 text-[10px]">{t('admin.lost')}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {users.every(u => u.purchases.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center opacity-30 text-slate-400">
                          <i className="fas fa-ticket-alt text-4xl mb-3 block"></i>
                          <p className="font-bold">{t('admin.no_purchase_records')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-slate-900 font-black text-base">{t('admin.all_users_list', { count: users.length })}</h3>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                >
                  <i className="fas fa-sync-alt"></i> {t('admin.refresh_data')}
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 text-slate-400 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-black">{t('admin.user_details')}</th>
                      <th className="px-6 py-4 font-black">{t('admin.balance')}</th>
                      <th className="px-6 py-4 font-black">{t('admin.purchase_records')}</th>
                      <th className="px-6 py-4 font-black">{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500">{u.username.charAt(0)}</div>
                            <div>
                              <div className="text-slate-900 font-black">{u.username}</div>
                              <div className="text-slate-400 text-[10px]">ID: {u.id} | {t('admin.status')}: {t('admin.active')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-emerald-600 font-black text-base">¥ {u.balance.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-slate-600 font-bold">{t('admin.orders', { count: u.purchases.length })}</div>
                        </td>
                        <td className="px-6 py-5">
                          <button onClick={() => startEditing(u)} className="text-blue-600 font-bold hover:text-blue-700">{t('admin.edit_user')}</button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center opacity-30 text-slate-400">
                          <i className="fas fa-users-slash text-4xl mb-3 block"></i>
                          <p className="font-bold">{t('admin.no_users')}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'system' && (
            <div className="max-w-md space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 font-black mb-6 flex items-center gap-2">
                  <i className="fas fa-image text-purple-500"></i> {t('admin.logo_mgmt')}
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                    <div className="text-[10px] text-slate-400 mb-3 uppercase font-black">{t('admin.current_logo_preview')}</div>
                    <img src={config.logoUrl} alt="Current Logo" className="h-8 max-w-full object-contain mb-4 filter drop-shadow-md" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-2 uppercase">{t('admin.upload_logo')}</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-white border border-slate-200 py-3 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-slate-600"
                      >
                        <i className="fas fa-upload"></i> {t('admin.select_file')}
                      </button>
                      <button 
                        onClick={resetLogo}
                        className="px-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100"
                      >
                        <i className="fas fa-undo"></i> {t('admin.reset_default')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-2 uppercase">{t('admin.logo_url')}</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 ring-blue-500/20"
                      value={config.logoUrl}
                      onChange={e => setConfig({...config, logoUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-slate-900 font-black mb-6">{t('admin.customer_service_settings')}</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold mb-2 uppercase">{t('admin.line_link')}</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-blue-600 outline-none focus:ring-2 ring-blue-500/20"
                      value={config.lineLink}
                      onChange={e => setConfig({...config, lineLink: e.target.value})}
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <button className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                      {t('admin.apply_settings')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 会员编辑模态框 */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-200 relative">
            <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><i className="fas fa-times text-xl"></i></button>
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
               {t('admin.edit_user_title')}: {editingUser.id}
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-2 uppercase">{t('admin.username')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-2 uppercase">{t('admin.email')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-2 uppercase">{t('admin.password')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-2 uppercase">{t('admin.balance')}</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-black text-emerald-600 focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editBalance}
                    onChange={e => setEditBalance(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-2 uppercase">{t('admin.bank_name')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editBankName}
                    onChange={e => setEditBankName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-black mb-2 uppercase">{t('admin.account_name')}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none" 
                    value={editAccountName}
                    onChange={e => setEditAccountName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">{t('common.cancel')}</button>
                 <button onClick={handleSaveUser} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">{t('admin.save_changes')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
