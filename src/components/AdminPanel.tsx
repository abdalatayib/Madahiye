import React from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { UserProfile, BloodRequest, Complaint } from '../types';
import { Users, FileText, AlertTriangle, Shield, Ban, CheckCircle, Search, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminPanel() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [requests, setRequests] = React.useState<BloodRequest[]>([]);
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = React.useState<'users' | 'requests' | 'complaints'>('users');
  const [searchTerm, setSearchTerm] = React.useState('');
  const { t } = useLanguage();

  React.useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
    });
    const unsubRequests = onSnapshot(query(collection(db, 'requests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BloodRequest)));
    });
    const unsubComplaints = onSnapshot(query(collection(db, 'complaints'), orderBy('createdAt', 'desc')), (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint)));
    });

    return () => {
      unsubUsers();
      unsubRequests();
      unsubComplaints();
    };
  }, []);

  const handleUpdateUserStatus = async (uid: string, status: UserProfile['status']) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-red-600" />
          {t('adminPanel')}
        </h1>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users className="w-4 h-4" />
            {t('manageUsers')}
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText className="w-4 h-4" />
            {t('manageRequests')}
          </button>
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'complaints' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <AlertTriangle className="w-4 h-4" />
            {t('allComplaints')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">User</th>
                    <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Blood Type</th>
                    <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                    <tr key={u.uid} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                            {u.displayName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.displayName}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="font-bold text-red-600">{u.bloodType}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' :
                          u.status === 'banned' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {t(u.status)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {u.status === 'active' ? (
                            <button 
                              onClick={() => handleUpdateUserStatus(u.uid, 'banned')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t('banUser')}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateUserStatus(u.uid, 'active')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={t('unbanUser')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="p-6 space-y-4">
            {requests.map(req => (
              <div key={req.id} className="p-4 border border-slate-100 rounded-xl hover:border-red-100 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center font-bold text-red-600">
                      {req.bloodType}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{req.hospitalName}</h3>
                      <p className="text-xs text-slate-500">{req.location}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    req.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t(req.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">Paid from:</span>
                    <span className="font-bold text-slate-900">{req.senderNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="text-slate-500">WhatsApp:</span>
                    <span className="font-bold text-slate-900">{req.whatsappNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-500">Call:</span>
                    <span className="font-bold text-slate-900">{req.callNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="p-6 space-y-4">
            {complaints.length === 0 ? (
              <p className="text-center text-slate-400 py-12 italic">No complaints filed.</p>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="p-4 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-red-600 uppercase">Complaint</span>
                    <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-4">{c.reason}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="text-xs text-slate-500">
                      Reporter UID: <span className="font-mono">{c.reporterUid}</span>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-bold uppercase">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
