
import React, { useState } from 'react';
import { LotteryGame } from '../types';

interface Props {
  games: LotteryGame[];
  history: any;
  onBack: () => void;
}

const DrawHistory: React.FC<Props> = ({ games, history, onBack }) => {
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});

  const toggleExpand = (gameId: string) => {
    setExpandedGames(prev => ({
      ...prev,
      [gameId]: !prev[gameId]
    }));
  };

  return (
    <div className="p-4 bg-white min-h-screen animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400 p-2 -ml-2 active:scale-90 transition-transform">
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <h2 className="text-lg font-black tracking-tight">過去の抽せん結果</h2>
      </div>

      {games.map(game => {
        // 获取所有历史记录并按日期倒序排列
        const gameHistory = Object.entries(history[game.id] || {}).sort((a, b) => b[0].localeCompare(a[0]));
        const isExpanded = expandedGames[game.id];
        
        // 分离最新一期和更早期的期次
        const latestDraw = gameHistory[0];
        const pastDraws = gameHistory.slice(1);

        return (
          <div key={game.id} className="mb-12 last:mb-20">
            {/* 彩种标题栏 */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: game.color }}></div>
              <h3 className="text-base font-black text-[#005bac]">{game.fullName}</h3>
            </div>

            <div className="space-y-3">
              {/* 最新一期开奖结果 */}
              {latestDraw && (
                <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.02]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] text-gray-500 font-bold bg-gray-50 px-2 py-1 rounded">
                      {latestDraw[0]} (第622回)
                    </span>
                    <p className="text-[11px] font-black text-red-600">1等：{game.maxJackpot}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(latestDraw[1] as number[]).map((n: number, i: number) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 rounded-full text-white text-[12px] flex items-center justify-center font-black shadow-sm"
                        style={{ backgroundColor: game.colorSecondary || game.color }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 收放按钮：位于最新结果的正下方，完全覆盖您指示的区域 */}
              <div className="pt-1">
                <button 
                  onClick={() => toggleExpand(game.id)}
                  className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] border ${
                    isExpanded 
                      ? 'bg-gray-100 border-gray-300 text-gray-700 shadow-inner' 
                      : 'bg-white border-gray-200 text-gray-500 shadow-sm hover:border-gray-300'
                  }`}
                >
                  <span className="text-[12px] font-black">
                    {isExpanded ? '履歴を閉じる' : '過去の抽せん結果をもっと見る'}
                  </span>
                  <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px] opacity-60 transition-transform duration-300`}></i>
                </button>
              </div>

              {/* 展开的历史列表 */}
              {isExpanded && (
                <div className="space-y-2.5 mt-2 animate-in slide-in-from-top-4 duration-300">
                  {pastDraws.length > 0 ? pastDraws.map(([date, nums]: any) => (
                    <div key={date} className="bg-gray-50/40 border border-dotted border-gray-200 p-4 rounded-xl flex justify-between items-center group">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block mb-2">{date}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {nums.map((n: number, i: number) => (
                            <div key={i} className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 text-[10px] flex items-center justify-center font-bold bg-white group-hover:border-gray-400 transition-colors">
                              {n}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                            <i className="fas fa-check text-green-500 text-[10px]"></i>
                         </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-[11px] text-gray-400 font-bold">これ以上の履歴はありません</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DrawHistory;
