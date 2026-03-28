
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack: () => void;
  onSubmit: (amount: number) => void;
}

const DepositView: React.FC<Props> = ({ onBack, onSubmit }) => {
  const { t } = useTranslation();
  const [val, setVal] = useState('');

  return (
    <div className="p-4 bg-white min-h-screen">
       <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-base font-black">{t('finance.deposit_title')}</h2>
      </div>

      <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: '#E6001208' }}>
        <p className="text-[10px] font-bold leading-tight mb-2" style={{ color: '#E60012' }}>
          {t('finance.deposit_info_title', { defaultValue: '入金について：' })}
        </p>
        <ul className="text-[9px] list-disc pl-4 space-y-1" style={{ color: '#E60012CC' }}>
          <li>{t('finance.deposit_info_1', { defaultValue: '申請後、LINEにてカスタマーサービスへ入金方法を確認してください。' })}</li>
          <li>{t('finance.deposit_info_2', { defaultValue: '入金確認後、5分以内に残高が反映されます。' })}</li>
          <li>{t('finance.deposit_info_3', { defaultValue: '入金金額は1:1のレートで円単位として反映されます。' })}</li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {[5000, 10000, 20000, 50000, 100000, 500000].map(amt => (
          <button 
            key={amt} 
            onClick={() => setVal(amt.toString())} 
            className={`py-3 rounded-lg text-xs font-bold border transition-all ${val === amt.toString() ? 'shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
            style={val === amt.toString() ? { borderColor: '#E60012', backgroundColor: '#E6001208', color: '#E60012' } : {}}
          >
            ¥{amt.toLocaleString()}
          </button>
        ))}
      </div>

      <input 
        type="number" 
        placeholder={t('finance.amount_placeholder', { defaultValue: '金額を入力' })}
        className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-sm mb-8 outline-none focus:ring-2 transition-all"
        style={{ '--tw-ring-color': '#E6001222' } as any}
        value={val}
        onChange={e => setVal(e.target.value)}
      />

      <button 
        onClick={() => onSubmit(parseFloat(val))}
        disabled={!val}
        className="w-full text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all"
        style={{ backgroundColor: '#E60012', boxShadow: '0 10px 25px -5px #E6001233' }}
      >
        {t('finance.submit_request')}
      </button>
    </div>
  );
};

export default DepositView;
