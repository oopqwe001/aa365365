

import React from 'react';
import { LotteryGame } from '../types';

interface Props {
  games: LotteryGame[];
  onBuy: (game: LotteryGame) => void;
  onShowHistory: () => void;
  winningNumbers: any;
}

const GameList: React.FC<Props> = ({ games, onBuy, onShowHistory, winningNumbers }) => {
  const today = new Date().toLocaleDateString('sv-SE');

  return (
    <div className="p-3 space-y-4 view-transition bg-[#f2f2f2]">
      {games.map(game => {
        const isDrawnToday = winningNumbers[game.id] && winningNumbers[game.id][today];
        
        return (
          <div 
            key={game.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm relative border border-gray-200"
          >
            {/* 公式風キャリーオーバータグ */}
            {(game.id === 'loto7' || game.id === 'loto6') && (
              <div className="absolute top-0 right-0 z-10">
                <div 
                  className="px-2 py-0.5 flex items-center justify-center border-l border-b border-black/5"
                  style={{
                    background: 'repeating-linear-gradient(-45deg, #fff100, #fff100 4px, #ffda00 4px, #ffda00 8px)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)'
                  }}
                >
                  <span className="text-[#005bac] text-[9px] font-[900] tracking-tighter whitespace-nowrap drop-shadow-sm">
                    キャリーオーバー発生中
                  </span>
                </div>
              </div>
            )}

            <div className="p-4">
              {/* 开奖状态提示 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-inner bg-[#f08300]">
                    <i className="fas fa-star"></i>
                  </div>
                  <span className="text-[11px] font-black text-gray-800">毎日が抽せん日</span>
                </div>
                
                {isDrawnToday ? (
                  <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">
                    <i className="fas fa-check-circle text-[9px]"></i>
                    <span className="text-[9px] font-black">本日抽せん済み</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100">
                    <i className="fas fa-clock text-[9px] animate-pulse"></i>
                    <span className="text-[9px] font-black">抽せん待機中</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 mb-3">
                {/* Logo区域 */}
                <div className="w-24 shrink-0 pt-1">
                  {game.id === 'loto7' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-14 border-[1.5px] border-[#e60012] rounded-[4px] bg-white flex flex-col items-center justify-center p-1">
                        <span className="text-[#e60012] text-[16px] font-[900] italic tracking-tighter leading-none mb-0.5">LOTO</span>
                        <div className="bg-[#e60012] text-white text-[10px] px-1.5 font-black rounded-sm leading-tight flex items-center justify-center">7</div>
                      </div>
                      <span className="text-[10px] font-black text-[#005bac] mt-1 tracking-tighter italic">ロトセブン</span>
                    </div>
                  )}
                  {game.id === 'loto6' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-14 border-[1.5px] border-[#d81b60] rounded-[4px] bg-white flex flex-col items-center justify-center p-1">
                        <span className="text-[#d81b60] text-[16px] font-[900] italic tracking-tighter leading-none mb-0.5">LOTO</span>
                        <div className="bg-[#d81b60] text-white text-[10px] px-1.5 font-black rounded-sm leading-tight flex items-center justify-center">6</div>
                      </div>
                      <span className="text-[10px] font-black text-[#005bac] mt-1 tracking-tighter italic">ロトシックス</span>
                    </div>
                  )}
                  {game.id === 'miniloto' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-14 rounded-[4px] bg-[#009b4f] flex items-center justify-center px-1 shadow-sm">
                        <span className="text-white text-[12px] font-[900] italic tracking-tighter leading-none whitespace-nowrap">MINI LOTO</span>
                      </div>
                      <span className="text-[10px] font-black text-[#005bac] mt-1 tracking-tighter italic">ミニロト</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-[#fffbe6] rounded-md border border-[#fceebb] py-2 px-1 text-center min-h-[70px] flex flex-col justify-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-[10px] font-black text-gray-700">{game.id === 'miniloto' ? '1等约' : '1等 最高'}</span>
                    <span className="text-[22px] font-[900] text-[#e60012] italic tracking-tighter leading-none">
                      {game.maxJackpot}
                    </span>
                  </div>
                  <div className="text-[8px] font-black text-gray-400 leading-none">
                    {game.id === 'miniloto' ? '※ 理論値' : '※ キャリーオーバー発生时'}
                  </div>
                </div>
              </div>

              <div className="text-center mb-3">
                <span className="text-[12px] font-black text-gray-800">1口：{game.price}円</span>
              </div>

              <div className="relative mb-4">
                <div className="official-dotted-line"></div>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-black text-gray-400 mr-1">発売締切:</span>
                  <span className="text-[11px] font-[900] text-[#f08300]">抽せん日当日の24:00まで</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={onShowHistory}
                  className="flex-1 bg-gray-100 h-10 rounded-sm text-[11px] font-black text-gray-700 active:bg-gray-200 border border-gray-100"
                >
                   抽せん結果
                </button>
                <button 
                  onClick={() => onBuy(game)} 
                  className="flex-1 bg-[#e60012] h-10 rounded-sm text-[11px] font-black text-white shadow-md active:opacity-90"
                >
                   ネット購入
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GameList;

