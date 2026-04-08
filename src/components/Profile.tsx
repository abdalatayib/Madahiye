import React from 'react';
import { UserProfile } from '../types';
import { User, Shield, Droplets, Star, ShieldCheck, Mail, Calendar, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion } from 'motion/react';

interface ProfileProps {
  user: UserProfile;
  onMessage?: () => void;
}

export default function Profile({ user, onMessage }: ProfileProps) {
  const { t } = useLanguage();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-red-600 to-red-700 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-4xl">
                {user.displayName.charAt(0)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20 pb-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-bold text-slate-900">{user.displayName}</h2>
                {user.role === 'admin' && (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    {t('adminPanel')}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold">{user.rating || 5.0}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {onMessage && (
                <button
                  onClick={onMessage}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                >
                  <Mail className="w-4 h-4" />
                  Message
                </button>
              )}
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-slate-100"
              >
                <LogOut className="w-4 h-4" />
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">{t('bloodType')}</h3>
          </div>
          <div className="text-4xl font-black text-red-600">{user.bloodType}</div>
          <p className="text-slate-500 text-sm mt-2">{t('donorStatus') || 'Active Donor'}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">{t('lastDonation') || 'Last Donation'}</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {user.lastDonationDate ? new Date(user.lastDonationDate).toLocaleDateString() : t('noDonations') || 'No donations yet'}
          </div>
          <p className="text-slate-500 text-sm mt-2">{t('donationSubtext') || 'Keep up the good work!'}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">{t('pointsWallet')}</h3>
          </div>
          <div className="text-4xl font-black text-amber-600">{user.points || 0}</div>
          <p className="text-slate-500 text-sm mt-2">{t('currentBalance')}</p>
          <div className="mt-4 text-xs text-slate-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div dangerouslySetInnerHTML={{__html: t('onePostOnePoint') + ' &nbsp; ' + t('onePointValue') + '<br/>' + t('minTopUp')}} />
            <br/>
            <span>To get points, contact <a href="https://wa.me/252771641609" target="_blank" rel="noopener noreferrer"><b>+252771641609</b></a> on WhatsApp.</span>
          </div>
        </motion.div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">{t('personalInfo')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('whatsappNumber')}</p>
              <p className="text-slate-900 font-medium">{user.whatsappNumber || t('none')}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('evcNumber')}</p>
              <p className="text-slate-900 font-medium">{user.evcNumber || t('none')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('gender')}</p>
              <p className="text-slate-900 font-medium capitalize">{t(user.gender || 'male')}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('status')}</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="text-slate-900 font-medium capitalize">{t(user.status)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
