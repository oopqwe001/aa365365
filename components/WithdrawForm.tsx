
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onSubmit: (data: any) => void;
}

const WithdrawForm: React.FC<Props> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    nameKana: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    onSubmit({ ...formData, amount: parseFloat(formData.amount) });
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400"><i className="fas fa-arrow-left"></i></button>
        <h2 className="text-base font-black">出金申請</h2>
      </div>

      <div className="bg-orange-50 p-3 rounded-lg mb-6 border border-orange-100">
        <p className="text-[10px] text-orange-700 font-bold leading-tight">
          【重要】出金には審査が必要です。通常1〜2営業日以内に完了します。口座名義が一致しない場合、承認されませんのでご注意ください。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">出金金額 (¥)</label>
          <input 
            type="number" 
            placeholder="金額を入力"
            className="w-full border-b-2 border-gray-100 py-3 outline-none focus:border-red-600 text-xl font-black"
            required
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">銀行名</label>
              <input type="text" className="w-full bg-white border border-gray-200 rounded p-2 text-xs" required 
                value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">支店名</label>
              <input type="text" className="w-full bg-white border border-gray-200 rounded p-2 text-xs" required
                value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">口座番号</label>
            <input type="text" className="w-full bg-white border border-gray-200 rounded p-2 text-xs" required
              value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">口座名義 (カナ)</label>
            <input type="text" className="w-full bg-white border border-gray-200 rounded p-2 text-xs" placeholder="ヤマダ タロウ" required
              value={formData.nameKana} onChange={e => setFormData({...formData, nameKana: e.target.value})} />
          </div>
        </div>

        <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-100">
          申請を送信する
        </button>
      </form>
    </div>
  );
};

export default WithdrawForm;
