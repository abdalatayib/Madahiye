import React from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Search, Droplets, Star, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

interface UserListProps {
  onViewProfile?: (uid: string) => void;
}

export default function UserList({ onViewProfile }: UserListProps) {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const { t } = useLanguage();

  React.useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-red-600" />
          {t('users')}
        </h2>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchUsers') || 'Search donors...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">{t('noUsersFound') || 'No donors found matching your search.'}</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <motion.div
              layout
              key={user.uid}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center font-bold text-red-600 text-lg">
                  {user.bloodType}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 truncate">{user.displayName}</h3>
                    {user.role === 'admin' && (
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{user.rating || 5.0}</span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">{t(user.gender || 'male')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('status')}: <span className="text-green-600">{t('active')}</span>
                </div>
                <button
                  className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                  onClick={() => onViewProfile && onViewProfile(user.uid)}
                >
                  {t('viewProfile') || 'View Profile'}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
