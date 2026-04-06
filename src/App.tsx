import React from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import DonationTracker from './components/DonationTracker';
import { Droplets } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

export default function App() {
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authReady, setAuthReady] = React.useState(false);
  const { t } = useLanguage();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      
      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Profile snapshot error:', error);
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <Droplets className="w-12 h-12 text-red-600 animate-bounce" />
          <div className="absolute inset-0 bg-red-400/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!profile) {
    return (
      <Layout user={null}>
        <div className="py-12">
          <ProfileSetup onComplete={(p) => setProfile(p)} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={profile}>
      <div className="space-y-8">
        {profile.status === 'banned' ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-700 mb-2">{t('accountBanned')}</h2>
            <p className="text-red-600 mb-6">
              {t('banReason')}
            </p>
            <div className="bg-white rounded-xl p-4 border border-red-100 text-sm text-slate-600 mb-6">
              {t('reinstateNotice')}
            </div>
            <button className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100">
              {t('contactSupport')}
            </button>
          </div>
        ) : (
          <>
            <DonationTracker user={profile} />
            <Dashboard user={profile} />
          </>
        )}
      </div>
    </Layout>
  );
}
