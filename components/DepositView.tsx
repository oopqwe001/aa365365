
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onSubmit: (amount: number) => void;
}

const DepositView: React.FC<Props> = ({ onBack, onSubmit }) => {
  const [val, setVal] = useState('');

  return (
    <div className="p-4 bg-white min-h-screen">
       <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-base font-black">入金申請</h2>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl mb-6">
        <p className="text-[10px] text-blue-700 font-bold leading-tight mb-2">
          入金について：
        </p>
        <ul className="text-[9px] text-blue-600/80 list-disc pl-4 space-y-1">
          <li>申請後、LINEにてカスタマーサービスへ入金方法を確認してください。</li>
          <li>入金確認後、5分以内に残高が反映されます。</li>
          <li>入金金額は1:1のレートで円単位として反映されます。</li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[5000, 10000, 20000, 50000, 100000, 500000].map(amt => (
          <button 
            key={amt} 
            onClick={() => setVal(amt.toString())} 
            className={`py-3 rounded-lg text-xs font-bold border transition-all ${val === amt.toString() ? 'border-blue-600 bg-blue-50 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
          >
            ¥{amt.toLocaleString()}
          </button>
        ))}
      </div>

      <input 
        type="number" 
        placeholder="金額を入力"
        className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-sm mb-8 outline-none focus:ring-2 ring-blue-100"
        value={val}
        onChange={e => setVal(e.target.value)}
      />

      <button 
        onClick={() => onSubmit(parseFloat(val))}
        disabled={!val}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
      >
        入金申請を送信
      </button>
    </div>
  );
};

export default DepositView;
