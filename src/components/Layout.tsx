import React from 'react';
import { LogOut, Droplets, Shield, LayoutDashboard } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  onViewChange?: (view: 'dashboard' | 'admin') => void;
  currentView?: 'dashboard' | 'admin';
}

export default function Layout({ children, user, onViewChange, currentView }: LayoutProps) {
  const { t } = useLanguage();
  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onViewChange?.('dashboard')}
            >
              <Droplets className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold tracking-tight text-slate-900">{t('appName')}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {user && (
                <div className="flex items-center gap-4">
                  {user.role === 'admin' && onViewChange && (
                    <button 
                      onClick={() => onViewChange(currentView === 'admin' ? 'dashboard' : 'admin')}
                      className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                        currentView === 'admin' 
                        ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
                        : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {currentView === 'admin' ? (
                        <>
                          <LayoutDashboard className="w-4 h-4" />
                          {t('dashboard')}
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          {t('adminPanel')}
                        </>
                      )}
                    </button>
                  )}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                    <Droplets className="w-4 h-4" />
                    {user.bloodType}
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>© 2026 {t('appName')} Blood Donation Platform. All rights reserved.</p>
          <p className="mt-2">{t('authSubtext')}</p>
        </div>
      </footer>
    </div>
  );
}
