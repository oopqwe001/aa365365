
import React from 'react';
import { User, AppView } from '../types';

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
  const isHome = view === 'home';

  return (
    <div className="bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-[60] h-[54px]">
      {/* 左侧区域：Logo 与 返回箭头 */}
      <div className="flex items-center h-full">
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
            onClick={onAdmin}
          >
            <div className="flex items-center gap-1.5">
              <div className="bg-[#e60012] px-1 py-0.5 rounded-sm">
                 <span className="text-white text-[12px] font-black italic tracking-tighter leading-none">LOTO</span>
              </div>
              <span className="text-[15px] font-[900] text-gray-800 tracking-tighter">宝くじ</span>
            </div>
          </div>
        )}
      </div>
      
      {/* 右侧区域：登录/注册 按钮组 */}
      <div className="flex items-center gap-2">
        {user.isLoggedIn ? (
          <div className="flex items-center gap-2">
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
              ログイン
            </button>
            <button 
              onClick={onRegisterView} 
              className="text-[10px] font-black border border-gray-200 text-gray-600 px-3 py-1.5 rounded-[4px] bg-white active:bg-gray-50 shadow-sm"
            >
              新規利用登録
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
