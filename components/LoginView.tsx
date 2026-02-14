
import React, { useState } from 'react';

interface Props {
  onBack: () => void;
  onSuccess: (email: string, pass: string) => void;
  onGoToRegister: () => void;
}

const LoginView: React.FC<Props> = ({ onBack, onSuccess, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(email, password);
  };

  return (
    <div className="min-h-full bg-white p-6 view-transition">
      <div className="mb-10 text-center">
        <div className="inline-block bg-[#e60012] px-3 py-1 rounded-sm mb-4 shadow-sm">
           <span className="text-white text-lg font-black italic tracking-tighter">LOTO 宝くじ</span>
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">おかえりなさい！</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">メールアドレス</label>
          <input 
            type="email" 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-red-100 transition-all"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">パスワード</label>
          <input 
            type="password" 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 ring-red-100 transition-all"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-gray-800 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-gray-200 active:scale-[0.98] transition-all"
        >
          ログイン
        </button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-300"><span className="bg-white px-2">OR</span></div>
        </div>

        <button 
          type="button"
          onClick={onGoToRegister}
          className="w-full bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-xl font-black text-sm active:bg-gray-50 transition-all"
        >
          新規アカウントを作成
        </button>
      </form>
    </div>
  );
};

export default LoginView;
