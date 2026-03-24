
import React from 'react';
import { LotteryGame } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
  games: LotteryGame[];
  onBuy: (game: LotteryGame) => void;
  onShowHistory: () => void;
  winningNumbers: any;
}

const GameList: React.FC<Props> = ({ games, onBuy, onShowHistory, winningNumbers }) => {
  const { t, i18n } = useTranslation();
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"})).toLocaleDateString('sv-SE');

  return (
    <div className="p-3 space-y-4 view-transition bg-[#f2f2f2]">
      {games.map(game => {
        const isDrawnToday = winningNumbers[game.id] && winningNumbers[game.id][today];
        
        return (
          <div 
            key={game.id} 
            className="bg-white rounded-lg overflow-hidden shadow-sm relative border border-gray-200"
          >
            {/* 黄色缎带 - 只在 LOTO 7 和 LOTO 6 显示 */}
            {(game.id === 'loto7' || game.id === 'loto6') && (
              <div className="absolute top-0 right-0 w-32 overflow-hidden h-16 pointer-events-none">
                  <div className="bg-[#fff100] text-[#333] text-[9px] font-[900] text-center py-0.5 w-[150%] absolute top-3 right-[-35px] rotate-[15deg] shadow-sm">
                      {t('home.carry_over')}
                  </div>
              </div>
            )}

            <div className="p-4">
              {/* 顶部：抽选日信息 与 开奖状态 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-inner bg-[#f08300]">
                    <i className="fas fa-star"></i>
                  </div>
                  <span className="text-[11px] font-black text-gray-800">{t('home.daily_draw')}</span>
                </div>
                
                {isDrawnToday ? (
                  <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">
                    <i className="fas fa-check-circle text-[9px]"></i>
                    <span className="text-[9px] font-black">{t('home.drawn_today')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-2 py-0.5 rounded border border-blue-100">
                    <i className="fas fa-clock text-[9px] animate-pulse"></i>
                    <span className="text-[9px] font-black">{t('home.waiting_draw')}</span>
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
                      <span className="text-[10px] font-black text-[#005bac] mt-1 tracking-tighter italic">{i18n.language === 'ja' ? 'ロトセブン' : '로또 7'}</span>
                    </div>
                  )}
                  {game.id === 'loto6' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-14 border-[1.5px] border-[#d81b60] rounded-[4px] bg-white flex flex-col items-center justify-center p-1">
                        <span className="text-[#d81b60] text-[16px] font-[900] italic tracking-tighter leading-none mb-0.5">LOTO</span>
                        <div className="bg-[#d81b60] text-white text-[10px] px-1.5 font-black rounded-sm leading-tight flex items-center justify-center">6</div>
                      </div>
                      <span className="text-[10px] font-black text-[#005bac] mt-1 tracking-tighter italic">{i18n.language === 'ja' ? 'ロトシックス' : '로또 6'}</span>
                    </div>
                  )}
                  {game.id === 'miniloto' && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-14 rounded-[4px] bg-[#009b4f] flex items-center justify-center px-1 shadow-sm">
                        <span className="text-white text-[12px] font-[900] italic tracking-tighter leading-none whitespace-nowrap">MINI LOTO</span>
                      </div>
                      <span className="text-[10px] font-black text-[#005bac] mt-1 tracking-tighter italic">{i18n.language === 'ja' ? 'ミニロト' : '미니 로또'}</span>
                    </div>
                  )}
                </div>

                {/* 右侧：中奖金额显示区 */}
                <div className="flex-1 bg-[#fffbe6] rounded-md border border-[#fceebb] py-2 px-1 text-center min-h-[70px] flex flex-col justify-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-[10px] font-black text-gray-700">{game.id === 'miniloto' ? t('home.jackpot_est') : t('home.jackpot_max')}</span>
                    <span className="text-[22px] font-[900] text-[#e60012] italic tracking-tighter leading-none">
                      {game.maxJackpot}
                    </span>
                  </div>
                  <div className="text-[8px] font-black text-gray-400 leading-none">
                    {game.id === 'miniloto' ? t('home.theoretical') : t('home.carry_over_msg')}
                  </div>
                </div>
              </div>

              <div className="text-center mb-3">
                <span className="text-[12px] font-black text-gray-800">{t('home.price_per_unit', { price: game.price })}</span>
              </div>

              <div className="relative mb-4">
                <div className="official-dotted-line"></div>
                <div className="text-center mt-2">
                  <span className="text-[10px] font-black text-gray-400 mr-1">{t('home.deadline')}</span>
                  <span className="text-[11px] font-[900] text-[#f08300]">{t('home.deadline_msg')}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={onShowHistory}
                  className="flex-1 bg-gray-100 h-10 rounded-sm text-[11px] font-black text-gray-700 active:bg-gray-200 border border-gray-100"
                >
                   {t('home.show_history')}
                </button>
                <button 
                  onClick={() => onBuy(game)} 
                  className="flex-1 bg-[#e60012] h-10 rounded-sm text-[11px] font-black text-white shadow-md active:opacity-90"
                >
                   {t('home.net_buy')}
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
