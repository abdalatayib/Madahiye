import React from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { BloodType, UserProfile } from '../types';
import { User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [bloodType, setBloodType] = React.useState<BloodType | ''>('');
  const [gender, setGender] = React.useState<'male' | 'female' | ''>('');
  const [whatsappNumber, setWhatsappNumber] = React.useState('');
  const [evcNumber, setEvcNumber] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodType || !gender) return;
    if (!auth.currentUser) return;

    setLoading(true);
    setError(null);

    const profile: UserProfile = {
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName || 'Anonymous',
      email: auth.currentUser.email || '',
      bloodType: bloodType as BloodType,
      gender: gender as 'male' | 'female',
      whatsappNumber,
      evcNumber,
      points: 0,
      status: 'active',
      role: auth.currentUser.email === 'tayib4986@gmail.com' ? 'admin' : 'user',
      rating: 5,
    };

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), profile);
      onComplete(profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
          <User className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{t('completeProfile')}</h2>
        <p className="text-slate-500 mt-2">{t('profileSubtext')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('bloodType')}</label>
          <div className="grid grid-cols-4 gap-2">
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setBloodType(type as BloodType)}
                className={`py-2 rounded-lg text-sm font-bold border transition-all ${
                  bloodType === type
                    ? 'bg-red-600 border-red-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-red-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('gender')}</label>
          <div className="flex gap-4">
            {['male', 'female'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g as 'male' | 'female')}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all capitalize ${
                  gender === g
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {t(g)}
              </button>
            ))}
          </div>
          {gender === 'female' && (
            <p className="mt-2 text-xs text-amber-600 flex gap-1 items-start">
              <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5" />
              {t('femaleNotice')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('whatsappNumber')}</label>
          <input 
            required
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="e.g. +252..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('evcNumber')}</label>
          <input 
            required
            type="tel"
            value={evcNumber}
            onChange={(e) => setEvcNumber(e.target.value)}
            placeholder="e.g. +252..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !bloodType || !gender}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
        >
          {loading ? t('loading') : t('completeRegistration')}
        </button>

        {error && (
          <p className="text-red-600 text-sm text-center mt-4">{error}</p>
        )}
      </form>
    </div>
  );
}
