
import React, { useState, useRef } from 'react';
import { AdminConfig, User, Transaction } from '../types';

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
  const [tab, setTab] = useState<'users' | 'finance' | 'lottery' | 'system'>('lottery');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="fixed inset-0 bg-[#0f1113] z-[100] text-gray-200 overflow-hidden flex flex-col font-sans">
      <header className="bg-[#1a1c1e] p-4 flex justify-between items-center border-b border-white/5 shadow-lg">
        <h2 className="text-lg font-black text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i className="fas fa-desktop text-sm"></i>
          </div>
          系统管理后台 <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-normal text-gray-400">V2.4 Pro</span>
        </h2>
        <button onClick={onBack} className="bg-white/5 border border-white/10 px-5 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition-all">
          退出管理后台
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 侧边导航 */}
        <aside className="w-52 bg-[#1a1c1e] border-r border-white/5 p-3 flex flex-col justify-between">
          <nav className="space-y-1.5">
            {[
              { id: 'lottery', label: '开奖结果管理', icon: 'fa-bullhorn', color: 'text-yellow-400' },
              { id: 'finance', label: '充提申请管理', icon: 'fa-shield-check', color: 'text-green-400' },
              { id: 'users', label: '会员信息管理', icon: 'fa-user-group', color: 'text-blue-400' },
              { id: 'system', label: '系统参数设置', icon: 'fa-cog', color: 'text-purple-400' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-[13px] font-bold flex items-center gap-3 transition-all ${tab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <i className={`fas ${item.icon} ${tab === item.id ? 'text-white' : item.color} text-base`}></i> {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-4 bg-black/20 rounded-xl">
             <div className="text-[10px] text-gray-500 mb-1">服务器状态</div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-300">正常运行中</span>
             </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-6 overflow-y-auto">
          {tab === 'lottery' && (
            <div className="max-w-4xl space-y-6">
              {/* 自动化开奖模块 */}
              <div className="bg-[#1a1c1e] rounded-2xl p-6 border border-white/5 shadow-sm bg-gradient-to-br from-[#1a1c1e] to-[#25282b]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-white font-black text-base flex items-center gap-2">
                      <i className="fas fa-bolt text-yellow-400"></i> 一键执行今日开奖
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 italic">
                      如果未手动预设号码，系统将自动随机生成。中奖金额将自动发放到会员账户余额。
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <input type="date" className="bg-[#0f1113] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" defaultValue={new Date().toISOString().split('T')[0]} id="exec-date" />
                   <button 
                    onClick={() => {
                      const dateVal = (document.getElementById('exec-date') as HTMLInputElement).value;
                      onExecuteDraw(dateVal);
                    }}
                    className="flex-1 bg-yellow-600 text-black py-3 rounded-xl font-black text-sm hover:bg-yellow-500 shadow-lg shadow-yellow-900/20 transition-all flex items-center justify-center gap-2"
                   >
                     <i className="fas fa-play"></i> 执行今日（或选定日期）开奖及派奖
                   </button>
                </div>
              </div>

              <div className="bg-[#1a1c1e] rounded-2xl p-6 border border-white/5 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-black text-base flex items-center gap-2">
                    <i className="fas fa-edit text-blue-500"></i> 手动预设下次开奖号码
                  </h3>
                  <span className="text-xs text-gray-500 italic">每天 08:00 (JST) 自动更新设置的号码</span>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2 uppercase">彩票类型</label>
                    <select className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 ring-blue-500/50">
                      <option>LOTO 7 (七乐透)</option>
                      <option>LOTO 6 (六乐透)</option>
                      <option>MINI LOTO (迷你乐透)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2 uppercase">生效日期</label>
                    <input type="date" className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-3 text-sm font-bold outline-none" defaultValue="2024-05-23" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 font-bold mb-2 uppercase">中奖号码 (使用英文逗号分隔)</label>
                  <input type="text" placeholder="例如: 1, 5, 12, 18, 22, 29, 35" className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-4 text-base font-black tracking-widest text-blue-400 outline-none" />
                </div>
                <button className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm hover:bg-blue-500 shadow-lg shadow-blue-900/30 transition-all">
                  保存预设中奖号码
                </button>
              </div>
            </div>
          )}

          {tab === 'finance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-4">
                 <h3 className="text-white font-black text-base">待审批的充值/提现请求</h3>
                 <span className="text-xs font-bold text-gray-500">共 {transactions.filter(t => t.status === 'pending').length} 件待处理</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {transactions.filter(t => t.status === 'pending').map(tx => (
                  <div key={tx.id} className="bg-[#1a1c1e] rounded-2xl p-5 border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down-left' : 'fa-arrow-up-right'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${tx.type === 'deposit' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                            {tx.type === 'deposit' ? '充值' : '提现'}
                          </span>
                          <span className="text-xs text-gray-400 font-bold">会员ID: {tx.userId}</span>
                          <span className="text-[10px] text-gray-600 font-medium">{new Date(tx.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-xl font-black text-white">¥ {tx.amount.toLocaleString()}</div>
                        {tx.bankDetails && (
                          <div className="mt-3 text-[11px] bg-black/40 p-3 rounded-lg border border-white/5 text-gray-300">
                             <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <div><span className="text-gray-500">银行名:</span> {tx.bankDetails.bankName}</div>
                                <div><span className="text-gray-500">支店名:</span> {tx.bankDetails.branchName}</div>
                                <div><span className="text-gray-500">账号:</span> {tx.bankDetails.accountNumber}</div>
                                <div><span className="text-gray-500">名义:</span> {tx.bankDetails.accountName}</div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onProcessTx(tx.id, 'rejected')} className="bg-red-500/10 text-red-400 border border-red-500/20 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-red-500/20 transition-all">驳回</button>
                      <button onClick={() => onProcessTx(tx.id, 'approved')} className="bg-green-600 text-white px-8 py-2.5 rounded-xl text-xs font-black hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all">通过并入账</button>
                    </div>
                  </div>
                ))}

                {transactions.filter(t => t.status === 'pending').length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center opacity-20">
                      <i className="fas fa-check-circle text-6xl mb-4"></i>
                      <p className="font-bold">目前没有待处理的请求</p>
                   </div>
                )}
              </div>
            </div>
          )}

          {tab === 'users' && (
            <div className="bg-[#1a1c1e] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-black/40 text-gray-400 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-black">会员详情</th>
                    <th className="px-6 py-4 font-black">账户余额</th>
                    <th className="px-6 py-4 font-black">购票情况</th>
                    <th className="px-6 py-4 font-black">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center font-black text-white">{u.username.charAt(0)}</div>
                          <div>
                            <div className="text-white font-black">{u.username}</div>
                            <div className="text-gray-500 text-[10px]">ID: {u.id} | 状态: 正常</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-green-400 font-black text-base">¥ {u.balance.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-gray-300 font-bold">{u.purchases.length} 个订单</div>
                      </td>
                      <td className="px-6 py-5">
                        <button onClick={() => setEditingUser(u)} className="text-blue-500 font-bold hover:text-blue-400">编辑信息/余额</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'system' && (
            <div className="max-w-md space-y-6">
              <div className="bg-[#1a1c1e] p-6 rounded-2xl border border-white/5 shadow-sm">
                <h3 className="text-white font-black mb-6 flex items-center gap-2">
                  <i className="fas fa-image text-purple-500"></i> Logo 图标管理
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                    <div className="text-[10px] text-gray-500 mb-3 uppercase font-black">当前 Logo 预览</div>
                    <img src={config.logoUrl} alt="Current Logo" className="h-8 max-w-full object-contain mb-4 filter drop-shadow-md" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2 uppercase">上传新 Logo</label>
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
                        className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-upload"></i> 选择本地文件
                      </button>
                      <button 
                        onClick={resetLogo}
                        className="px-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20"
                      >
                        <i className="fas fa-undo"></i> 重置默认
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2 uppercase">通过图片 URL 指定</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-3 text-sm font-bold text-gray-300 outline-none"
                      value={config.logoUrl}
                      onChange={e => setConfig({...config, logoUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1c1e] p-6 rounded-2xl border border-white/5 shadow-sm">
                <h3 className="text-white font-black mb-6">客服参数设置</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] text-gray-500 font-bold mb-2 uppercase">LINE 客服连接地址</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0f1113] border border-white/10 rounded-xl p-3 text-sm font-bold text-blue-400 outline-none"
                      value={config.lineLink}
                      onChange={e => setConfig({...config, lineLink: e.target.value})}
                    />
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <button className="w-full bg-green-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-green-500 transition-all">
                      提交并应用设置
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#1a1c1e] w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-white/10 relative">
            <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><i className="fas fa-times text-xl"></i></button>
            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
               编辑会员资料: {editingUser.id}
            </h3>
            <div className="space-y-6">
              <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                <label className="block text-[10px] text-gray-500 font-black mb-3 uppercase">手动调整余额 (当前: ¥{editingUser.balance.toLocaleString()})</label>
                <div className="flex gap-3">
                  <input type="number" className="flex-1 bg-[#0f1113] border border-white/10 p-4 rounded-xl text-lg font-black text-green-400 outline-none" placeholder="输入新的余额" />
                  <button className="bg-blue-600 px-6 rounded-xl font-black text-xs">应用修改</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 font-black mb-2 uppercase">银行名</label>
                  <input type="text" className="w-full bg-[#0f1113] border border-white/10 p-3.5 rounded-xl text-sm font-bold" defaultValue={editingUser.bankInfo.bankName} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-black mb-2 uppercase">账户名义</label>
                  <input type="text" className="w-full bg-[#0f1113] border border-white/10 p-3.5 rounded-xl text-sm font-bold" defaultValue={editingUser.bankInfo.accountName} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-white/5 text-gray-400 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">取消</button>
                 <button onClick={() => { alert('会员信息已成功更新。'); setEditingUser(null); }} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all">确认保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
