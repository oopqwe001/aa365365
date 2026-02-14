
import React from 'react';

interface Props {
  lineLink: string;
}

const CustomerService: React.FC<Props> = ({ lineLink }) => {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] pointer-events-none z-[60]">
      <div className="absolute bottom-24 right-5 pointer-events-auto group">
        {/* 外围脉冲光晕 */}
        <div className="absolute inset-0 bg-[#06c755] rounded-full animate-ping opacity-20 scale-125"></div>
        
        <a 
          href={lineLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-14 h-14 bg-[#06c755] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(6,199,85,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white"
        >
          <i className="fab fa-line text-white text-3xl"></i>
          
          {/* 红色角标优化 */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#e60012] border-[3px] border-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-[10px] font-black italic">1</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default CustomerService;
