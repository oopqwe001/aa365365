
import React from 'react';
import { Purchase, LotteryGame } from '../types';

interface Props {
  purchases: Purchase[];
  games: LotteryGame[];
  onBack: () => void;
}

const PurchaseHistory: React.FC<Props> = ({ purchases, games, onBack }) => {
  const getGame = (id: string) => games.find(g => g.id === id);

  const sortedPurchases = [...purchases].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-full bg-gray-50 pb-10 animate-in fade-in duration-300">
      <div className="p-4 bg-white sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 p-2 -ml-2 active:scale-90 transition-transform">
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <h2 className="text-lg font-black tracking-tight">購入履歴</h2>
      </div>

      <div className="p-4 space-y-4">
        {sortedPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-ticket-alt text-4xl mb-4 opacity-20"></i>
            <p className="text-sm font-bold">購入履歴はありません</p>
          </div>
        ) : (
          sortedPurchases.map((p) => {
            const game = getGame(p.gameId);
            const date = new Date(p.timestamp).toLocaleString('ja-JP', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-4 rounded-full" style={{ backgroundColor: game?.color }}></div>
                    <span className="text-sm font-black text-gray-800">{game?.fullName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{date}</span>
                </div>
                
                <div className="p-4 space-y-3">
                  {p.numbers.map((numsStr, idx) => {
                    const nums = numsStr.split(',').map(Number);
                    return (
                      <div key={idx} className="flex flex-wrap gap-1.5">
                        {nums.map((n, i) => (
                          <div 
                            key={i} 
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border ${
                              p.status === 'won' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-600'
                            }`}
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">ステータス:</span>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      p.status === 'won' ? 'bg-red-100 text-red-600' : 
                      p.status === 'lost' ? 'bg-gray-200 text-gray-500' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {p.status === 'won' ? '当せん' : p.status === 'lost' ? 'はずれ' : '抽せん待ち'}
                    </span>
                  </div>
                  {p.status === 'won' && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-red-400 block leading-none">獲得賞金</span>
                      <span className="text-sm font-black text-red-600">¥{p.winAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;
