
import React from 'react';
import { User, AppView } from '../types';

interface Props {
  user: User;
  onAction: (view: AppView) => void;
  onLogout: () => void;
}

const MyPage: React.FC<Props> = ({ user, onAction, onLogout }) => {
  return (
    <div className="min-h-full bg-[#fffdf0] pb-10 view-transition">
      <div className="p-5">
        <h2 className="text-[22px] font-black text-[#333] mb-6 tracking-tight">マイページ</h2>
        
        {/* 余额卡片 - 增加黄色装饰与阴影 */}
        <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 mb-8 relative overflow-hidden">
          {/* 顶部黄色装饰条 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffd700] via-[#fff100] to-[#ffd700]"></div>
          
          <div className="text-center">
            <p className="text-[13px] text-gray-400 font-bold mb-2">お預かり当せん金</p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-2xl font-black text-[#1a1c1e]">¥</span>
              <span className="text-4xl font-black text-[#1a1c1e] tracking-tighter">
                {user.balance.toLocaleString()}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => onAction('deposit')}
                className="flex-[1.2] bg-[#e60012] text-white py-3.5 rounded-xl font-black text-[14px] shadow-lg shadow-red-100 active:scale-95 transition-all"
              >
                チャージ
              </button>
              <button 
                onClick={() => onAction('withdraw')}
                className="flex-1 bg-gray-50 text-gray-500 py-3.5 rounded-xl font-bold text-[14px] border border-gray-100 active:bg-gray-100 transition-all"
              >
                出金申請
              </button>
            </div>
          </div>
        </div>

        {/* 列表菜单 - 对齐截图样式 */}
        <div className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.02)]">
          {[
            { icon: 'fa-history', label: '取引履歴', action: () => onAction('transactions') },
            { icon: 'fa-credit-card', label: '口座設定' },
            { icon: 'fa-shield-alt', label: 'セキュリティ' },
            { icon: 'fa-question-circle', label: 'ヘルプ' },
            { icon: 'fa-sign-out-alt', label: 'ログアウト', action: onLogout }
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.action}
              className="w-full px-6 py-5 flex items-center justify-between border-b last:border-none border-gray-50 active:bg-gray-50 text-left transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 flex justify-center">
                  <i className={`fas ${item.icon} text-gray-400 group-hover:text-[#e60012] transition-colors`}></i>
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
