
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Purchase, LotteryGame } from '../types';
import { motion } from 'motion/react';
import { Share2, Download, ChevronLeft, Trophy, Calendar, Ticket, Coins } from 'lucide-react';

interface Props {
  purchase: Purchase;
  game: LotteryGame | undefined;
  onBack: () => void;
}

const ShareWinView: React.FC<Props> = ({ purchase, game, onBack }) => {
  const { t, i18n } = useTranslation();

  const date = purchase.drawDate 
    ? new Date(purchase.drawDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(purchase.timestamp).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  return (
    <div className="min-h-full bg-[#f8f9fa] flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white border-b border-gray-50 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 active:scale-90 transition-transform text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-medium tracking-widest text-gray-400">{t('share.title', { defaultValue: '当選証明书' })}</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-start gap-6">
        {/* The Poster Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[360px] bg-white rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden relative border border-gray-100"
        >
          {/* Card Top - Bright Red Background */}
          <div className="h-32 bg-[#E60012] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/20"></div>
            
            {/* Trophy Icon in Yellow Circle */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-gradient-to-b from-[#ffcc33] to-[#ff9900] flex items-center justify-center shadow-lg z-10"
            >
              <Trophy size={40} className="text-white" />
            </motion.div>
          </div>

          <div className="p-8 flex flex-col items-center text-center">
            <h3 className="text-[22px] font-bold mb-1 text-[#1a1a1a] tracking-tight">
              {t('share.congrats', { defaultValue: 'おめでとうございます！' })}
            </h3>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-gray-400 mb-8">
              OFFICIAL WINNING RECORD
            </p>

            {/* Details List */}
            <div className="w-full space-y-6 text-left">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{t('share.game_label', { defaultValue: '宝くじの種類' })}</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{game?.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{t('share.date_label', { defaultValue: '抽せん日時' })}</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{t('share.rank_label', { defaultValue: '当選等级' })}</p>
                  <p className="text-sm font-bold text-[#E60012]">
                    {purchase.rank ? purchase.rank.split(', ').map(r => t(`history.${r}`)).join(', ') : t('history.win_amount_label')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-gray-100">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Coins size={16} className="text-[#c5a059]" />
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{t('share.amount_label', { defaultValue: '当選金额' })}</span>
                  </div>
                  <span className="text-xl font-bold text-[#E60012]">¥{purchase.winAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Seal */}
            <div className="mt-10 flex flex-col items-center opacity-30">
              <div className="w-14 h-14 border-2 border-gray-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-[8px] font-bold leading-none text-center uppercase text-gray-500">Verified<br/>Winner</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full max-w-[360px]">
          <button 
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl font-bold text-xs active:scale-95 transition-transform shadow-lg"
            style={{ backgroundColor: '#E60012' }}
          >
            <Download size={16} />
            {t('share.btn_save', { defaultValue: 'SAVE' })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareWinView;
