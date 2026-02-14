
import React, { useState } from 'react';
import { Transaction } from '../types';

interface Props {
  userId: string;
  transactions: Transaction[];
  onBack: () => void;
}

const TransactionHistory: React.FC<Props> = ({ userId, transactions, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const userTxs = transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-[9px] font-black border border-orange-100">承認待ち</span>;
      case 'approved': return <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[9px] font-black border border-green-100">完了</span>;
      case 'rejected': return <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-[9px] font-black border border-red-100">不備あり</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400 p-2 -ml-2 active:scale-90 transition-transform">
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <h2 className="text-lg font-black tracking-tight text-gray-800">資金履歴</h2>
      </div>

      {userTxs.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <i className="fas fa-receipt text-gray-200 text-3xl"></i>
          </div>
          <p className="text-gray-400 text-sm font-bold">まだお取引がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userTxs.map(tx => (
            <div key={tx.id} className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
              <div 
                className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${expandedId === tx.id ? 'bg-gray-50' : 'active:bg-gray-50'}`}
                onClick={() => tx.type === 'withdraw' && setExpandedId(expandedId === tx.id ? null : tx.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                    <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-sm`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black text-gray-700">{tx.type === 'deposit' ? '入金申請' : '出金申請'}</span>
                      {getStatusLabel(tx.status)}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold tracking-tight">{formatDate(tx.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black tracking-tighter ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' ? '+' : '-'} ¥{tx.amount.toLocaleString()}
                  </div>
                  {tx.type === 'withdraw' && (
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[8px] text-gray-300 font-bold uppercase">Details</span>
                      <i className={`fas fa-chevron-down text-[8px] text-gray-300 transition-transform duration-300 ${expandedId === tx.id ? 'rotate-180' : ''}`}></i>
                    </div>
                  )}
                </div>
              </div>

              {/* 展开的提现银行详情 */}
              {tx.type === 'withdraw' && expandedId === tx.id && (
                <div className="bg-gray-50/80 px-4 py-5 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Bank Details</span>
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                  </div>
                  
                  {tx.bankDetails ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-black block">銀行名</label>
                          <div className="text-[11px] font-bold text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">{tx.bankDetails.bankName}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-black block">支店名</label>
                          <div className="text-[11px] font-bold text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">{tx.bankDetails.branchName}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-black block">口座番号</label>
                          <div className="text-[11px] font-bold text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">{tx.bankDetails.accountNumber}</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400 font-black block">口座名義 (カナ)</label>
                          <div className="text-[11px] font-bold text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">{tx.bankDetails.accountName}</div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-between items-center opacity-60">
                        <span className="text-[8px] text-gray-400 font-bold">Transaction ID: {tx.id}</span>
                        <div className="flex items-center gap-1">
                           <i className="fas fa-lock text-[8px]"></i>
                           <span className="text-[8px] text-gray-400 font-bold">Secure Info</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-[10px] text-gray-400 italic">情報が記録されていません</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
