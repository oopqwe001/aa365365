
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

  const date = new Date(purchase.timestamp).toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Lottery Win!',
        text: `I won ¥${purchase.winAmount.toLocaleString()} in ${game?.fullName}!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser. You can take a screenshot!');
    }
  };

  return (
    <div className="min-h-full bg-[#f8f9fa] flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">{t('share.title', { defaultValue: 'WINNING CERTIFICATE' })}</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-8">
        {/* The "Exquisite" Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="w-full max-w-[340px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative border border-gray-50"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-32 opacity-10" style={{ backgroundColor: game?.color }}></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-5" style={{ backgroundColor: game?.color }}></div>
          
          <div className="relative p-8 flex flex-col items-center text-center">
            {/* Trophy Icon */}
            <motion.div 
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg mb-6"
            >
              <Trophy size={40} className="text-white" />
            </motion.div>

            <h3 className="text-2xl font-black text-gray-900 mb-1 leading-tight">
              {t('share.congrats', { defaultValue: 'CONGRATULATIONS!' })}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-8">
              Official Winning Record
            </p>

            {/* Details Grid */}
            <div className="w-full space-y-6 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('share.game_label', { defaultValue: 'Lottery Game' })}</p>
                  <p className="text-sm font-black text-gray-800">{game?.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('share.date_label', { defaultValue: 'Draw Date' })}</p>
                  <p className="text-sm font-black text-gray-800">{date}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{t('share.rank_label', { defaultValue: 'Prize Rank' })}</p>
                  <p className="text-sm font-black text-red-600">
                    {purchase.rank ? purchase.rank.split(', ').map(r => t(`history.${r}`)).join(', ') : t('history.win_amount_label')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Coins size={16} className="text-yellow-600" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('share.amount_label', { defaultValue: 'Prize Amount' })}</span>
                  </div>
                  <span className="text-xl font-black text-red-600">¥{purchase.winAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Seal */}
            <div className="mt-10 flex flex-col items-center opacity-30">
              <div className="w-12 h-12 border-2 border-gray-400 rounded-full flex items-center justify-center mb-2">
                <span className="text-[8px] font-black leading-none text-center uppercase">Verified<br/>Winner</span>
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest">Digital Certificate ID: {purchase.id.slice(-8)}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full max-w-[340px] grid grid-cols-2 gap-4">
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs active:scale-95 transition-transform shadow-lg"
          >
            <Share2 size={16} />
            {t('share.btn_share', { defaultValue: 'SHARE' })}
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 py-4 rounded-2xl font-black text-xs active:scale-95 transition-transform shadow-sm"
          >
            <Download size={16} />
            {t('share.btn_save', { defaultValue: 'SAVE' })}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 font-medium text-center max-w-[280px]">
          {t('share.disclaimer', { defaultValue: 'This is a digital representation of your winning record. Please keep your account secure.' })}
        </p>
      </div>
    </div>
  );
};

export default ShareWinView;
