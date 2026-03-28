
import React, { useState } from 'react';
import { lotteryApi } from '@/services/api';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack: () => void;
  onSuccess: (email: string, pass: string) => void;
  onGoToRegister: () => void;
}

const LoginView: React.FC<Props> = ({ onBack, onSuccess, onGoToRegister }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(email, password);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setMessage({ text: t('auth.email_required'), type: 'error' });
      return;
    }
    setLoading(true);
    const res = await lotteryApi.sendPasswordReset(email);
    setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
    setLoading(false);
  };

  return (
    <div className="min-h-full bg-white p-6 view-transition">
      <div className="mb-10 text-center">
        <div className="inline-block bg-[#e60012] px-3 py-1 rounded-sm mb-4 shadow-sm">
           <span className="text-white text-lg font-black italic tracking-tighter">LOTO 宝くじ</span>
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">{t('auth.welcome_back')}</h2>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-green-50 text-green-600' : ''}`}
             style={message.type === 'error' ? { backgroundColor: '#E6001208', color: '#E60012', border: '1px solid #E6001222' } : {}}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">{t('auth.email')}</label>
          <input 
            type="email" 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#E6001222' } as any}
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider">{t('auth.password')}</label>
            <button 
              type="button" 
              onClick={handleResetPassword}
              disabled={loading}
              className="text-[10px] font-black text-blue-600 hover:underline disabled:opacity-50"
            >
              {t('auth.forgot_password')}
            </button>
          </div>
          <input 
            type="password" 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#E6001222' } as any}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit"
          className="w-full text-white py-4 rounded-xl font-black text-sm shadow-xl active:scale-[0.98] transition-all"
          style={{ backgroundColor: '#E60012', boxShadow: '0 10px 25px -5px #E6001233' }}
        >
          {t('auth.login_btn')}
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
          {t('auth.register_btn')}
        </button>
      </form>
    </div>
  );
};

export default LoginView;
