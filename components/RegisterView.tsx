
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  onBack: () => void;
  onSuccess: (userData: any) => void;
}

const RegisterView: React.FC<Props> = ({ onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.password_mismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.password_too_short'));
      return;
    }

    onSuccess(formData);
  };

  return (
    <div className="min-h-full bg-white p-6 view-transition">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">{t('common.register')}</h2>
        <p className="text-xs text-gray-400 font-bold">{t('auth.register_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">{t('auth.username')}</label>
          <input 
            type="text" 
            placeholder={t('auth.username_placeholder')}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#E6001222' } as any}
            required
            value={formData.username}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">{t('auth.email')}</label>
          <input 
            type="email" 
            placeholder="example@mail.com"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#E6001222' } as any}
            required
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">{t('auth.password')}</label>
          <input 
            type="password" 
            placeholder={t('auth.password_placeholder')}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#E6001222' } as any}
            required
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[11px] font-black text-gray-500 mb-2 uppercase tracking-wider">{t('auth.password_confirm')}</label>
          <input 
            type="password" 
            placeholder={t('auth.password_confirm_placeholder')}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': '#E6001222' } as any}
            required
            value={formData.confirmPassword}
            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>

        {error && (
          <div className="text-[11px] font-bold p-3 rounded-lg border" style={{ backgroundColor: '#E6001208', color: '#E60012', borderColor: '#E6001222' }}>
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        )}

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full text-white py-4 rounded-xl font-black text-sm shadow-xl active:scale-[0.98] transition-all"
            style={{ backgroundColor: '#E60012', boxShadow: '0 10px 25px -5px #E6001233' }}
          >
            {t('auth.register_btn')}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed px-4">
          {t('auth.terms_msg')}
        </p>
      </form>
    </div>
  );
};

export default RegisterView;
