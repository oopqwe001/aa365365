
import React from 'react';
import { User, AppView } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User;
  onAction: (view: AppView) => void;
  onLogout: () => void;
}

const MyPage: React.FC<Props> = ({ user, onAction, onLogout }) => {
  const { t } = useTranslation();
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-full bg-[#fffdf0] pb-10 view-transition">
      <div className="p-5">
        <div className="flex flex-col mb-6">
          <h2 className="text-[22px] font-black text-[#333] tracking-tight">{t('common.mypage')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[14px] font-bold text-gray-700">{user.username}</span>
            <span className="text-[11px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">ID: {user.displayId || '-----'}</span>
          </div>
        </div>
        
        {/* 余额卡片 - 增加黄色装饰与阴影 */}
        <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 mb-8 relative overflow-hidden">
          {/* 顶部黄色装饰条 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffd700] via-[#fff100] to-[#ffd700]"></div>
          
          <div className="text-center">
            <p className="text-[13px] text-gray-400 font-bold mb-2">{t('common.balance_label')}</p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-2xl font-black text-[#1a1c1e]">¥</span>
              <span className="text-4xl font-black text-[#1a1c1e] tracking-tighter">
                {user.balance.toLocaleString()}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => onAction('deposit')}
                className="flex-[1.2] text-white py-3.5 rounded-xl font-black text-[14px] shadow-lg active:scale-95 transition-all"
                style={{ backgroundColor: '#E60012', boxShadow: '0 10px 25px -5px #E6001233' }}
              >
                {t('common.deposit')}
              </button>
              <button 
                onClick={() => onAction('withdraw')}
                className="flex-1 bg-gray-50 text-gray-500 py-3.5 rounded-xl font-bold text-[14px] border border-gray-100 active:bg-gray-100 transition-all"
              >
                {t('common.withdraw')}
              </button>
            </div>
          </div>
        </div>

        {/* 列表菜单 - 对齐截图样式 */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
          {[
            ...(isAdmin ? [{ icon: 'fa-user-shield', label: t('common.admin'), action: () => onAction('admin') }] : []),
            { icon: 'fa-ticket-alt', label: t('common.purchases'), action: () => onAction('purchases') },
            { icon: 'fa-history', label: t('common.transactions'), action: () => onAction('transactions') },
            { icon: 'fa-credit-card', label: t('common.account_settings') },
            { icon: 'fa-shield-alt', label: t('common.security') },
            { icon: 'fa-question-circle', label: t('common.help') },
            { icon: 'fa-sign-out-alt', label: t('common.logout'), action: onLogout }
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.action}
              className="w-full px-6 py-5 flex items-center justify-between border-b last:border-none border-gray-50 active:bg-gray-50 text-left transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 flex justify-center">
                  <i className={`fas ${item.icon} text-gray-400 group-hover:text-[#E60012] transition-colors`}></i>
                </div>
                <span className="text-[15px] font-bold text-[#444]">{item.label}</span>
              </div>
              <i className="fas fa-chevron-right text-[12px] text-gray-300"></i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
