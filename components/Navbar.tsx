
import React from 'react';
import { User, AppView } from '../types';
import { useTranslation } from 'react-i18next';

interface Props {
  user: User;
  view: AppView;
  logoUrl: string;
  onLoginView: () => void;
  onRegisterView: () => void;
  onAdmin: () => void;
  onBack: () => void;
}

const Navbar: React.FC<Props> = ({ user, view, logoUrl, onLoginView, onRegisterView, onAdmin, onBack }) => {
  const { t, i18n } = useTranslation();
  const isHome = view === 'home';

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ja' ? 'ko' : 'ja';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-[60] h-[54px]">
      {/* 左侧区域：Logo 与 返回箭头 */}
      <div className="flex items-center h-full gap-3">
        {!isHome ? (
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 -ml-1 text-gray-800 active:scale-90 transition-transform"
          >
            <i className="fas fa-chevron-left text-[18px]"></i>
          </button>
        ) : (
          <div 
            className="flex items-center cursor-pointer active:opacity-70 transition-opacity gap-2" 
            onClick={() => {
              if (user.role === 'admin') {
                onAdmin();
              }
            }}
          >
            <div className="flex items-center gap-1.5">
              <div className="bg-[#e60012] px-1 py-0.5 rounded-sm">
                 <span className="text-white text-[12px] font-black italic tracking-tighter leading-none">LOTO</span>
              </div>
              <span className="text-[15px] font-[900] text-gray-800 tracking-tighter">{t('home.title')}</span>
            </div>
          </div>
        )}

        {/* 语言切换按钮 */}
        <button 
          onClick={toggleLanguage}
          className="text-[10px] font-black border border-slate-200 text-slate-500 px-2 py-1 rounded bg-slate-50 active:scale-95 transition-all flex items-center gap-1"
        >
          <i className="fas fa-globe text-[10px]"></i>
          {i18n.language === 'ja' ? 'JP' : 'KR'}
        </button>
      </div>
      
      {/* 右侧区域：登录/注册 按钮组 */}
      <div className="flex items-center gap-2">
        {user.isLoggedIn ? (
          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <button 
                onClick={onAdmin}
                className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 border border-blue-100 active:scale-90 transition-transform"
                title={t('common.admin')}
              >
                <i className="fas fa-user-shield text-[12px]"></i>
              </button>
            )}
            <span className="text-[13px] font-[900] text-[#e60012] italic">¥{user.balance.toLocaleString()}</span>
            <div className="w-7 h-7 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 border border-gray-100">
              <i className="fas fa-user text-[10px]"></i>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button 
              onClick={onLoginView} 
              className="text-[10px] font-black border border-gray-200 text-gray-600 px-3 py-1.5 rounded-[4px] bg-white active:bg-gray-50 shadow-sm"
            >
              {t('common.login')}
            </button>
            <button 
              onClick={onRegisterView} 
              className="text-[10px] font-black border border-gray-200 text-gray-600 px-3 py-1.5 rounded-[4px] bg-white active:bg-gray-50 shadow-sm"
            >
              {t('common.register')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
