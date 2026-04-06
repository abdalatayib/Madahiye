import React from 'react';
import { LogOut, Droplets, Shield, LayoutDashboard, Users, User, Star } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile | null;
  onViewChange?: (view: 'dashboard' | 'admin' | 'users' | 'profile') => void;
  currentView?: 'dashboard' | 'admin' | 'users' | 'profile';
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
                <div className="flex items-center gap-2">
                  {onViewChange && (
                    <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                      <button 
                        onClick={() => onViewChange('dashboard')}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          currentView === 'dashboard' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('dashboard')}</span>
                      </button>
                      <button 
                        onClick={() => onViewChange('users')}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          currentView === 'users' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('users')}</span>
                      </button>
                      <button 
                        onClick={() => onViewChange('profile')}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          currentView === 'profile' 
                          ? 'bg-white text-red-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('profile')}</span>
                      </button>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => onViewChange('admin')}
                          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                            currentView === 'admin' 
                            ? 'bg-white text-red-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('adminPanel')}</span>
                        </button>
                      )}
                    </div>
                  )}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {user.points || 0}
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                    <Droplets className="w-4 h-4" />
                    {user.bloodType}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      {user && onViewChange && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-50 flex justify-around items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === 'dashboard' ? 'text-red-600' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('dashboard')}</span>
          </button>
          <button 
            onClick={() => onViewChange('users')}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === 'users' ? 'text-red-600' : 'text-slate-400'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('users')}</span>
          </button>
          <button 
            onClick={() => onViewChange('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === 'profile' ? 'text-red-600' : 'text-slate-400'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{t('profile')}</span>
          </button>
          {user.role === 'admin' && (
            <button 
              onClick={() => onViewChange('admin')}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentView === 'admin' ? 'text-red-600' : 'text-slate-400'
              }`}
            >
              <Shield className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{t('adminPanel')}</span>
            </button>
          )}
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>© 2026 {t('appName')} Blood Donation Platform. All rights reserved.</p>
          <p className="mt-2">{t('authSubtext')}</p>
        </div>
      </footer>
    </div>
  );
}
