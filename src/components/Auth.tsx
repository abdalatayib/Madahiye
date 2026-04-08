import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Droplets, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import InstallPWAButton from './InstallPWAButton';

export default function Auth() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { t } = useLanguage();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Auth Error Details:', err);
      if (err.code === 'auth/internal-error') {
        setError(t('authInternalError') || 'Firebase Auth is still provisioning or domain is not authorized. Please wait a few minutes and try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(t('authUnauthorizedDomain') + ' (' + window.location.hostname + ')');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8">
        <LanguageSwitcher />
      </div>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
            <Droplets className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t('welcome')}</h1>
          <p className="text-slate-500 mt-2">{t('authSubtext')}</p>
        </div>

        <InstallPWAButton />
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">{t('rulesTitle')}</p>
              <ul className="list-disc list-inside mt-1 space-y-1 opacity-90">
                <li>{t('rule1')}</li>
                <li>{t('rule2')}</li>
                <li>{t('rule3')}</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            {loading ? t('signingIn') : t('signInGoogle')}
          </button>
          
          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          {t('termsNotice')}
        </p>
      </div>
    </div>
  );
}
