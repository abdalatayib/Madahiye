import React from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { BloodRequest, UserProfile, RequestUrgency, BloodType } from '../types';
import { Plus, Droplets, MapPin, Hospital, Clock, AlertCircle, CheckCircle2, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [requests, setRequests] = React.useState<BloodRequest[]>([]);
  const [myRequests, setMyRequests] = React.useState<BloodRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'requests' | 'activity'>('requests');
  const { t } = useLanguage();

  React.useEffect(() => {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'open')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BloodRequest));
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user.uid) return;
    const q = query(
      collection(db, 'requests'),
      where('recipientUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BloodRequest));
      setMyRequests(reqs);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const reqRef = doc(db, 'requests', requestId);
      await updateDoc(reqRef, {
        status: 'matched',
        donorUid: user.uid
      });
      const reqData = (await getDoc(reqRef)).data();
      await addDoc(collection(db, 'donations'), {
        requestId,
        donorUid: user.uid,
        recipientUid: reqData?.recipientUid,
        donationDate: new Date().toISOString(),
        status: 'pending'
      });
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('bloodType')}</p>
            <p className="text-2xl font-bold text-slate-900">{user.bloodType}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('communityRating')}</p>
            <p className="text-2xl font-bold text-slate-900">{user.rating || 5.0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('status')}</p>
            <p className="text-2xl font-bold text-slate-900 capitalize">{t(user.status)}</p>
          </div>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'requests' 
            ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
            : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          {t('activeRequests')}
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'activity' 
            ? 'bg-red-600 text-white shadow-lg shadow-red-100' 
            : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          {t('myActivity')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 space-y-6 ${activeTab !== 'requests' ? 'hidden lg:block' : ''}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              {t('activeRequests')}
            </h2>
            <div className="flex flex-col items-end gap-1">
              <button 
                onClick={() => setShowRequestForm(true)}
                disabled={(user.points || 0) < 1 && user.role !== 'admin'}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {t('postRequest')}
              </button>
              {(user.points || 0) < 1 && user.role !== 'admin' && (
                <p className="text-[10px] text-red-500 font-medium max-w-[200px] text-right">
                  {t('needPointsToPost')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <Droplets className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">{t('noRequests')}</p>
              </div>
            ) : (
              requests.map((req) => (
                <motion.div 
                  layout
                  key={req.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center font-bold text-red-600">
                        {req.bloodType}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{req.hospitalName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {req.location}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      req.urgency === 'emergency' ? 'bg-red-100 text-red-700' :
                      req.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {t(req.urgency)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('postedOn')} {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    {req.recipientUid !== user.uid && (
                      <button 
                        onClick={() => handleAcceptRequest(req.id)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-all"
                      >
                        {t('acceptRequest')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className={`space-y-6 ${activeTab !== 'activity' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-red-900 flex items-center gap-2">
                <Star className="w-4 h-4" />
                {t('pointsWallet')}
              </h3>
              <span className="text-xs font-bold text-red-600">{user.points || 0} {t('points')}</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{t('currentBalance')}</p>
                <p className="text-2xl font-bold text-slate-900">{user.points || 0} <span className="text-sm font-medium text-slate-500">{t('points')}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 font-medium">{t('onePostOnePoint')}</p>
                <p className="text-xs text-slate-600 font-medium">{t('onePointValue')}</p>
              </div>
              <div className="pt-3 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-900 mb-1">{t('topUpInfo')}</p>
                <p className="text-[10px] text-slate-500 mb-2">{t('minTopUp')}</p>
                <div className="bg-slate-50 p-2 rounded-lg text-[10px] text-slate-600">
                  {t('topUpContact')}
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900">{t('myActivity')}</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-700">{t('myRequests')}</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {myRequests.length === 0 ? (
                <p className="p-4 text-xs text-slate-400 text-center italic">{t('noRequests')}</p>
              ) : (
                myRequests.map(req => (
                  <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-900">{req.bloodType} {t('postRequest')}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        req.status === 'open' ? 'bg-green-100 text-green-700' :
                        req.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t(req.status)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{req.hospitalName}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-red-600 rounded-2xl p-6 text-white shadow-xl shadow-red-100">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t('theLaw')}
            </h3>
            <ul className="text-xs space-y-3 opacity-90">
              <li className="flex gap-2">
                <span className="font-bold shrink-0">•</span>
                <span>{t('law1')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">•</span>
                <span>{t('law2')}</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">•</span>
                <span>{t('law3')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRequestForm && (
          <RequestFormModal 
            user={user} 
            onClose={() => setShowRequestForm(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestFormModal({ user, onClose }: { user: UserProfile, onClose: () => void }) {
  const [bloodType, setBloodType] = React.useState<BloodType>(user.bloodType);
  const [hospital, setHospital] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [urgency, setUrgency] = React.useState<RequestUrgency>('medium');
  const [paymentPhone, setPaymentPhone] = React.useState(user.evcNumber || '');
  const [senderPhone, setSenderPhone] = React.useState('');
  const [contactWhatsApp, setContactWhatsApp] = React.useState(user.whatsappNumber || '');
  const [contactPhone, setContactPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((user.points || 0) < 1 && user.role !== 'admin') {
      alert(t('needPointsToPost'));
      return;
    }

    setLoading(true);
    try {
      // Deduct point (client-side for now, should be server-side)
      if (user.role !== 'admin') {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          points: (user.points || 0) - 1
        });
      }

      await addDoc(collection(db, 'requests'), {
        recipientUid: user.uid,
        bloodType,
        hospitalName: hospital,
        location,
        urgency,
        status: 'open',
        paymentPhone,
        senderPhone,
        contactWhatsApp,
        contactPhone,
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      console.error("Error posting request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">{t('postBloodRequest')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Plus className="w-6 h-6 rotate-45 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('bloodType')}</label>
                <select 
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value as BloodType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('urgency')}</label>
                <select 
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="low">{t('low')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="high">{t('high')}</option>
                  <option value="emergency">{t('emergency')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('hospitalName')}</label>
              <div className="relative">
                <Hospital className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder={t('hospitalName')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('location')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('location')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('whatsappNumber')}</label>
                  <input 
                    required
                    type="tel"
                    value={contactWhatsApp}
                    onChange={(e) => setContactWhatsApp(e.target.value)}
                    placeholder="WhatsApp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('callNumber')}</label>
                  <input 
                    required
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Call"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100 mt-4 disabled:opacity-50"
            >
              {loading ? t('posting') : t('postRequest')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
