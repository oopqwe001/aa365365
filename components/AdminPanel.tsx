
import React, { useState, useRef, useMemo } from 'react';
import { AdminConfig, User, Transaction, Purchase } from '../types';
import { lotteryApi } from '../services/api';

interface Props {
  config: AdminConfig;
  setConfig: (config: AdminConfig) => void;
  onBack: () => void;
  users: User[];
  transactions: Transaction[];
  onProcessTx: (id: string, status: 'approved' | 'rejected') => void;
  onUpdateUser: (uid: string, data: any) => void;
  onExecuteDraw: (date: string) => void;
}

const AdminPanel: React.FC<Props> = ({ config, setConfig, onBack, users, transactions, onProcessTx, onUpdateUser, onExecuteDraw }) => {
  const [tab, setTab] = useState<'users' | 'finance' | 'lottery' | 'system' | 'prizes' | 'orders'>('lottery');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setConfig({ ...config, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const updatePrize = (gameId: string, tier: 'tier1' | 'tier2' | 'tier3', value: string) => {
    const val = parseInt(value) || 0;
    const newConfig = { ...config };
    if (!newConfig.prizeSettings[gameId]) {
      newConfig.prizeSettings[gameId] = { tier1: 0, tier2: 0, tier3: 0 };
    }
    newConfig.prizeSettings[gameId][tier] = val;
    setConfig(newConfig);
  };

  // 提取所有购票记录
  const allOrders = useMemo(() => {
    const orders: { user: User, purchase: Purchase }[] = [];
    users.forEach(u => {
      u.purchases.forEach(p => {
        orders.push({ user: u, purchase: p });
      });
    });
    return orders.sort((a, b) => b.purchase.timestamp - a.purchase.timestamp);
  }, [users]);

  const handleSetForcedWin = async (userId: string, purchaseId: string, tier: 1 | 2 | 3 | 0) => {
    const success = await lotteryApi.updatePurchaseTier(userId, purchaseId, tier);
    if (success) {
      alert('中奖干预设置成功！下次执行该日期开奖时生效。');
      window.location.reload(); // 简单刷新以获取最新状态
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1113] z-[100] text-gray-200 overflow-hidden flex flex-col font-sans">
      <header className="bg-[#1a1c1e] p-4 flex justify-between items-center border-b border-white/5 shadow-lg">
        <h2 className="text-lg font-black text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-desktop text-sm"></i>
          </div>
          系统管理后台 <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-normal text-gray-400">V2.5 Pro</span>
        </h2>
        <button onClick={onBack} className="bg-white/5 border border-white/10 px-5 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition-all">
          退出管理后台
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边导航 */}
        <aside className="w-56 bg-[#1a1c1e] border-r border-white/5 p-3 flex flex-col justify-between">
          <nav className="space-y-1">
            {[
              { id: 'lottery', label: '开奖结果管理', icon: 'fa-bullhorn', color: 'text-yellow-400' },
              { id: 'prizes', label: '中奖金额设置', icon: 'fa-coins', color: 'text-orange-400' },
              { id: 'orders', label: '投注记录干预', icon: 'fa-ticket-alt', color: 'text-cyan-400' },
              { id: 'finance', label: '充提申请审批', icon: 'fa-shield-check', color: 'text-green-400' },
              { id: 'users', label: '会员信息管理', icon: 'fa-user-group', color: 'text-blue-400' },
              { id: 'system', label: '系统参数设置', icon: 'fa-cog', color: 'text-purple-400' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold flex items-center gap-3 transition-all ${tab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <i className={`fas ${item.icon} ${tab === item.id ? 'text-white' : item.color} text-sm`}></i> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {tab === 'lottery' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-[#1a1c1e] rounded-2xl p-6 border border-white/5 shadow-sm bg-gradient-to-br from-[#1a1c1e] to-[#25282b]">
                <h3 className="text-white font-black text-base flex items-center gap-2 mb-4">
                  <i className="fas fa-bolt text-yellow-400"></i> 一键执行今日开奖
                </h3>
                <div className="flex gap-4">
                   <input type="date" className="bg-[#0f1113] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" defaultValue={new Date().toLocaleDateString('sv-SE')} id="exec-date" />
                   <button 
                    onClick={() => {
                      const dateVal = (document.getElementById('exec-date') as HTMLInputElement).value;
                      onExecuteDraw(dateVal);
                    }}
                    className="flex-1 bg-yellow-600 text-black py-3 rounded-xl font-black text-sm hover:bg-yellow-500 shadow-lg transition-all"
                   >
                     执行开奖及派奖 (含内定逻辑)
                   </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'prizes' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-[#1a1c1e] rounded-2xl p-6 border border-white/5">
                <h3 className="text-white font-black text-base mb-6">各彩种中奖金额配置 (单位：円)</h3>
                <div className="space-y-8">
                  {['loto7', 'loto6', 'miniloto'].map(gameId => (
                    <div key={gameId} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                      <h4 className="text-blue-400 font-black text-sm mb-4 uppercase">{gameId} 奖金设置</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(tier => (
                          <div key={tier}>
                            <label className="block text-[10px] text-gray-500 font-bold mb-1 italic">{tier}等奖金额</label>
                            <input 
                              type="number" 
                              className="w-full bg-[#0f1113] border border-white/10 rounded-lg p-2.5 text-xs font-black text-white"
                              value={config.prizeSettings[gameId]?.[`tier${tier}` as 'tier1' | 'tier2' | 'tier3'] || 0}
                              onChange={(e) => updatePrize(gameId, `tier${tier}` as any, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => { lotteryApi.saveConfig(config); alert('设置已保存'); }}
                  className="mt-8 w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-500 shadow-lg transition-all"
                >
                  保存所有奖金配置
                </button>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="text-white font-black text-base">会员投注记录 (人工干预中心)</h3>
                 <span className="text-xs font-bold text-gray-500">显示最近的所有订单</span>
              </div>
              
              <div className="bg-[#1a1c1e] rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-black/40 text-gray-400 uppercase">
                    <tr>
                      <th className="px-4 py-3 font-black">会员/时间</th>
                      <th className="px-4 py-3 font-black">彩种/号码</th>
                      <th className="px-4 py-3 font-black">状态/内定项</th>
                      <th className="px-4 py-3 font-black">人工操作 (控制中奖)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allOrders.map(({ user, purchase }) => (
                      <tr key={purchase.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-bold text-white">{user.username}</div>
                          <div className="text-gray-500 text-[9px]">{new Date(purchase.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-blue-400 font-black mb-1">{purchase.gameId.toUpperCase()}</div>
                          <div className="flex flex-wrap gap-1">
                            {purchase.numbers[0].map((n, i) => (
                              <span key={i} className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-[10px] text-white">{n}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {purchase.isProcessed ? (
                            <span className={`px-2 py-0.5 rounded ${purchase.status === 'won' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                              {purchase.status === 'won' ? `中奖 ¥${purchase.winAmount.toLocaleString()}` : '未中奖'}
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded w-fit">待开奖</span>
                              {purchase.forcedWinTier !== undefined && purchase.forcedWinTier > 0 && (
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded w-fit animate-pulse font-black">
                                  内定：{purchase.forcedWinTier}等奖
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {!purchase.isProcessed && (
                            <div className="flex gap-1">
                              <button onClick={() => handleSetForcedWin(user.id, purchase.id, 1)} className="bg-red-600 text-white px-2 py-1 rounded text-[9px] font-black hover:bg-red-500">内定1等</button>
                              <button onClick={() => handleSetForcedWin(user.id, purchase.id, 2)} className="bg-orange-600 text-white px-2 py-1 rounded text-[9px] font-black hover:bg-orange-500">内定2等</button>
                              <button onClick={() => handleSetForcedWin(user.id, purchase.id, 3)} className="bg-blue-600 text-white px-2 py-1 rounded text-[9px] font-black hover:bg-blue-500">内定3等</button>
                              <button onClick={() => handleSetForcedWin(user.id, purchase.id, 0)} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-[9px] font-black hover:bg-gray-600">必不中</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'finance' && (
            <div className="space-y-4">
              <h3 className="text-white font-black text-base">待审批的充值/提现请求</h3>
              <div className="grid grid-cols-1 gap-3">
                {transactions.filter(t => t.status === 'pending').map(tx => (
                  <div key={tx.id} className="bg-[#1a1c1e] rounded-2xl p-5 border border-white/5 flex justify-between items-center group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}`}></i>
                      </div>
                      <div>
                        <div className="text-xl font-black text-white">¥ {tx.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 font-bold">会员ID: {tx.userId} | {tx.type === 'deposit' ? '充值' : '提现'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onProcessTx(tx.id, 'rejected')} className="bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl text-xs font-black">驳回</button>
                      <button onClick={() => onProcessTx(tx.id, 'approved')} className="bg-green-600 text-white px-8 py-2.5 rounded-xl text-xs font-black">通过入账</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="bg-[#1a1c1e] rounded-2xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead className="bg-black/40 text-gray-400 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-black">会员详情</th>
                    <th className="px-6 py-4 font-black">账户余额</th>
                    <th className="px-6 py-4 font-black">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5 flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center font-black text-white">{u.username.charAt(0)}</div>
                        <div>
                          <div className="text-white font-black">{u.username}</div>
                          <div className="text-gray-500 text-[10px]">ID: {u.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-green-400 font-black text-base">¥ {u.balance.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <button onClick={() => setEditingUser(u)} className="text-blue-500 font-bold hover:text-blue-400">编辑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'system' && (
            <div className="max-w-md space-y-6">
              <div className="bg-[#1a1c1e] p-6 rounded-2xl border border-white/5">
                <h3 className="text-white font-black mb-6">Logo 与 客服设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2">LOGO URL</label>
                    <input type="text" className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-3 text-xs" value={config.logoUrl} onChange={e => setConfig({...config, logoUrl: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2">LINE 链接</label>
                    <input type="text" className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-3 text-xs" value={config.lineLink} onChange={e => setConfig({...config, lineLink: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 会员编辑模态框 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#1a1c1e] w-full max-w-md rounded-3xl p-8 border border-white/10 relative">
            <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-gray-500"><i className="fas fa-times text-xl"></i></button>
            <h3 className="text-lg font-black text-white mb-6">编辑会员余额: {editingUser.username}</h3>
            <div className="space-y-6">
              <input type="number" id="new-balance" className="w-full bg-[#0f1113] border border-white/10 p-4 rounded-xl text-xl font-black text-green-400 outline-none" defaultValue={editingUser.balance} />
              <button 
                onClick={() => {
                  const newBal = parseInt((document.getElementById('new-balance') as HTMLInputElement).value) || 0;
                  onUpdateUser(editingUser.id, { balance: newBal });
                  setEditingUser(null);
                  alert('余额已更新');
                  window.location.reload();
                }}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

