import React from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { BloodRequest, UserProfile, RequestUrgency, BloodType, DonationRecord, ChatMessage, ChatConversation } from '../types';
import { Plus, Droplets, MapPin, Hospital, Clock, AlertCircle, CheckCircle2, Star, ShieldCheck, Phone, MessageSquare, Edit, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [requests, setRequests] = React.useState<BloodRequest[]>([]);
  const [myRequests, setMyRequests] = React.useState<BloodRequest[]>([]);
  const [adminRequests, setAdminRequests] = React.useState<BloodRequest[]>([]);
  const [donations, setDonations] = React.useState<DonationRecord[]>([]);
  const [showRequestForm, setShowRequestForm] = React.useState(false);
  const [editingRequest, setEditingRequest] = React.useState<BloodRequest | null>(null);
  const [activeTab, setActiveTab] = React.useState<'requests' | 'myPosts' | 'profile' | 'admin' | 'users'>('requests');
  const [loading, setLoading] = React.useState(true);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [adminUsers, setAdminUsers] = React.useState<UserProfile[]>([]);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [selectedChatUser, setSelectedChatUser] = React.useState<UserProfile | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = React.useState<UserProfile | null>(null);
  const [showChatInterface, setShowChatInterface] = React.useState(false);
  const [chatConversations, setChatConversations] = React.useState<ChatConversation[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState<{ displayName: string; bloodType: BloodType; gender: 'male' | 'female' | ''; whatsappNumber: string; evcNumber: string }>({ displayName: '', bloodType: 'A+', gender: 'male', whatsappNumber: '', evcNumber: '' });
  const canPostRequest = (user.points || 0) > 0;
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
    }, (error) => {
      console.error('Dashboard requests snapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user.uid) return;
    const q = query(
      collection(db, 'donations'),
      where('donorUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DonationRecord));
      setDonations(dons);
    }, (error) => {
      console.error('Dashboard donations snapshot error:', error);
    });

    return () => unsubscribe();
  }, [user.uid]);

  React.useEffect(() => {
    if (user.email !== 'tayib4986@gmail.com') return;

    const adminQuery = query(collection(db, 'requests'));
    const unsubscribe = onSnapshot(adminQuery, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BloodRequest));
      setAdminRequests(reqs);
    }, (error) => {
      console.error('Dashboard admin requests snapshot error:', error);
    });

    return () => unsubscribe();
  }, [user.email]);

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

  const handleEditRequest = (request: BloodRequest) => {
    setEditingRequest(request);
    setShowRequestForm(true);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (confirm(t('confirmDelete'))) {
      try {
        await deleteDoc(doc(db, 'requests', requestId));
      } catch (err) {
        console.error("Error deleting request:", err);
      }
    }
  };

  const handleMarkSuccess = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), { status: 'completed' });
    } catch (err) {
      console.error("Error marking success:", err);
    }
  };

  const handleAdminRequestStatus = async (requestId: string, status: 'open' | 'matched' | 'completed' | 'cancelled' | 'paid') => {
    try {
      const reqRef = doc(db, 'requests', requestId);
      await updateDoc(reqRef, { status });
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  const handleOpenConversation = (userToChat: UserProfile) => {
    setSelectedChatUser(userToChat);
    setShowChatInterface(true);
  };

  const handleAdjustUserPoints = async (userId: string, amount: number) => {
    try {
      const targetUser = adminUsers.find((u) => u.uid === userId);
      await updateDoc(doc(db, 'users', userId), {
        points: Math.max((targetUser?.points || 0) + amount, 0),
      });
    } catch (err) {
      console.error('Error adjusting points:', err);
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    // Prevent admin from banning themselves
    const targetUser = adminUsers.find((u) => u.uid === userId);
    if (targetUser && targetUser.email === 'tayib4986@gmail.com') {
      alert('You cannot ban your own admin account.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: ban ? 'banned' : 'active',
      });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Delete this user permanently?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileForm.displayName,
        bloodType: profileForm.bloodType,
        gender: profileForm.gender,
        whatsappNumber: profileForm.whatsappNumber,
        evcNumber: profileForm.evcNumber,
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  React.useEffect(() => {
    if (showChatInterface && !selectedChatUser && chatConversations.length > 0) {
      const firstConv = chatConversations[0];
      const otherUserId = firstConv.participants.find((id) => id !== user.uid);
      const otherUser = users.find((u) => u.uid === otherUserId);
      if (otherUser) {
        setSelectedChatUser(otherUser);
      }
    }
  }, [showChatInterface, chatConversations, selectedChatUser, user.uid, users]);

  // Load all users for normal browsing
  React.useEffect(() => {
    const usersQuery = query(collection(db, 'users'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const userProfiles = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(userProfiles.filter(u => u.uid !== user.uid)); // Exclude current user
    }, (error) => {
      console.error('Dashboard users snapshot error:', error);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Load all users for admin management
  React.useEffect(() => {
    if (user.role !== 'admin' && user.email !== 'tayib4986@gmail.com') return;

    const adminUsersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(adminUsersQuery, (snapshot) => {
      const userProfiles = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setAdminUsers(userProfiles);
    }, (error) => {
      console.error('Dashboard admin users snapshot error:', error);
    });

    return () => unsubscribe();
  }, [user.role, user.email]);

  React.useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName,
        bloodType: user.bloodType,
        gender: user.gender || 'male',
        whatsappNumber: user.whatsappNumber || '',
        evcNumber: user.evcNumber || '',
      });
    }
  }, [user]);

  // Load chat messages when a user is selected
  React.useEffect(() => {
    if (!selectedChatUser) return;

    const chatQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
        .filter(msg => 
          (msg.senderUid === user.uid && msg.receiverUid === selectedChatUser.uid) ||
          (msg.senderUid === selectedChatUser.uid && msg.receiverUid === user.uid)
        )
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      setChatMessages(messages);
    }, (error) => {
      console.error('Dashboard chat messages snapshot error:', error);
    });

    return () => unsubscribe();
  }, [selectedChatUser, user.uid]);

  // Load chat conversations
  React.useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      const conversationsMap = new Map<string, ChatConversation>();

      allMessages.forEach((message) => {
        const otherUserId = message.senderUid === user.uid ? message.receiverUid : message.senderUid;
        const conversationId = [user.uid, otherUserId].sort().join('_');

        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            id: conversationId,
            participants: [user.uid, otherUserId],
            lastMessage: message.message,
            lastMessageTime: message.timestamp,
            unreadCount: { [user.uid]: 0, [otherUserId]: 0 }
          });
        }
      });

      setChatConversations(Array.from(conversationsMap.values()));
    }, (error) => {
      console.error('Dashboard conversations snapshot error:', error);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleSendMessage = async () => {
    if (!selectedChatUser || !newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderUid: user.uid,
        receiverUid: selectedChatUser.uid,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        participants: [user.uid, selectedChatUser.uid].sort()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
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

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowChatInterface(!showChatInterface)}
          className="w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all flex items-center justify-center relative"
        >
          <MessageSquare className="w-6 h-6" />
          {chatConversations.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
              {chatConversations.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium ${activeTab === 'requests' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}
        >
          {t('activeRequests')}
        </button>
        <button
          onClick={() => setActiveTab('myPosts')}
          className={`px-4 py-2 font-medium ${activeTab === 'myPosts' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}
        >
          {t('myPosts')}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}
        >
          {t('profile')}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}
        >
          Users
        </button>
        {user.email === 'tayib4986@gmail.com' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 font-medium ${activeTab === 'admin' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500'}`}
          >
            Admin
          </button>
        )}
      </div>

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                {t('activeRequests')}
              </h2>
              <button 
                onClick={() => { setEditingRequest(null); setShowRequestForm(true); }}
                disabled={!canPostRequest}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-100 ${canPostRequest ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
              >
                <Plus className="w-4 h-4" />
                {t('postRequest')}
              </button>
            </div>
            {!canPostRequest && (
              <p className="text-sm text-red-600 mt-3">
                You need points to post. Please check your <strong>Profile Tab</strong> and message <a href="https://wa.me/252771641609" target="_blank" rel="noreferrer" className="font-bold text-red-600">+252771641609</a> on WhatsApp to top-up (Minimum <strong>4 Points</strong> / <strong>$2.00</strong>).
              </p>
            )}

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
                    
                    <div className="mt-4 grid gap-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {req.contactPhone || t('noPhoneProvided')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        {req.contactWhatsApp || t('noWhatsappProvided')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t('sentFrom')}</span>
                        {req.senderPhone || t('noSenderPhone')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t('sendMoneyTo')}</span>
                        {req.paymentPhone || '252617498686'}
                      </div>
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

          <div className="space-y-6">
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
      )}

      {activeTab === 'myPosts' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">{t('myPosts')}</h2>
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <Droplets className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">{t('noRequests')}</p>
              </div>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
                  <div className="mt-4 grid gap-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {req.contactPhone || t('noPhoneProvided')}
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      {req.contactWhatsApp || t('noWhatsappProvided')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{t('sentFrom')}</span>
                      {req.senderPhone || t('noSenderPhone')}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{t('sendMoneyTo')}</span>
                      {req.paymentPhone || '252617498686'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('postedOn')} {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {req.status !== 'paid' && req.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => handleEditRequest(req)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                          >
                            <Edit className="w-3 h-3 inline mr-1" />
                            {t('edit')}
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            {t('delete')}
                          </button>
                        </>
                      )}
                      {req.status === 'matched' && (
                        <button
                          onClick={() => handleMarkSuccess(req.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          {t('markSuccess')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">{t('profile')}</h2>
            <button
              onClick={() => {
                if (isEditingProfile) {
                  setProfileForm({
                    displayName: user.displayName,
                    bloodType: user.bloodType,
                    gender: user.gender || 'male',
                    whatsappNumber: user.whatsappNumber || '',
                    evcNumber: user.evcNumber || '',
                  });
                }
                setIsEditingProfile((prev) => !prev);
              }}
              className="inline-flex items-center justify-center rounded-full border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              {isEditingProfile ? t('cancel') : t('editProfile')}
            </button>
          </div>

          {/* Cover Picture */}
          <div className="relative h-48 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl overflow-hidden">
            {user.coverPicture && (
              <img 
                src={user.coverPicture} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-4 left-4 flex items-end gap-4">
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white overflow-hidden">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-500 font-bold text-xl">{user.displayName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold">{user.displayName}</h3>
                <p className="text-sm opacity-90">{user.bloodType} • {user.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Points Wallet</h3>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Current Balance</p>
                      <p className="text-3xl font-bold text-slate-900">{user.points || 0} Points</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      <p><strong>1 Post = 1 Point</strong></p>
                      <p><strong>1 Point = $0.50 USD</strong></p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-red-50 p-4 text-slate-900">
                  <p className="font-bold">Top-up Info</p>
                  <p className="mt-2 text-sm">Minimum top-up is <strong>4 Points ($2.00 USD)</strong>.</p>
                  <p className="mt-2 text-sm">To get points, contact <a href="https://wa.me/252771641609" target="_blank" rel="noreferrer" className="font-bold text-red-600">+252771641609</a> on WhatsApp.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:w-[48%]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">{t('personalInfo')}</h3>
                    {isEditingProfile && (
                      <button
                        onClick={handleSaveProfile}
                        disabled={!profileForm.displayName || !profileForm.bloodType || !profileForm.gender || !profileForm.whatsappNumber || !profileForm.evcNumber}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('save')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {isEditingProfile ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('name')}</label>
                          <input
                            value={profileForm.displayName}
                            onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('bloodType')}</label>
                          <select
                            value={profileForm.bloodType}
                            onChange={(e) => setProfileForm({ ...profileForm, bloodType: e.target.value as BloodType })}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          >
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('gender')}</label>
                          <select
                            value={profileForm.gender}
                            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value as 'male' | 'female' | '' })}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          >
                            <option value="">Select gender</option>
                            <option value="male">{t('male')}</option>
                            <option value="female">{t('female')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('whatsappNumber')}</label>
                          <input
                            value={profileForm.whatsappNumber}
                            onChange={(e) => setProfileForm({ ...profileForm, whatsappNumber: e.target.value })}
                            placeholder={t('whatsappNumberPlaceholder')}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">{t('evcNumber')}</label>
                          <input
                            value={profileForm.evcNumber}
                            onChange={(e) => setProfileForm({ ...profileForm, evcNumber: e.target.value })}
                            placeholder={t('evcNumberPlaceholder')}
                            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <p><strong>{t('name')}:</strong> {user.displayName}</p>
                        <p><strong>{t('email')}:</strong> {user.email}</p>
                        <p><strong>{t('bloodType')}:</strong> {user.bloodType}</p>
                        <p><strong>{t('gender')}:</strong> {t(user.gender || 'male')}</p>
                        <p><strong>{t('whatsappNumber')}:</strong> {user.whatsappNumber || t('noWhatsappProvided')}</p>
                        <p><strong>{t('evcNumber')}:</strong> {user.evcNumber || t('none')}</p>
                        <p><strong>{t('status')}:</strong> {t(user.status)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-4">{t('donationStats')}</h3>
                  <div className="space-y-2">
                    <p><strong>{t('totalDonations')}:</strong> {donations.length}</p>
                    <p><strong>{t('lastDonation')}:</strong> {donations.length > 0 ? new Date(Math.max(...donations.map(d => new Date(d.donationDate).getTime()))).toLocaleDateString() : t('none')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          {selectedUserProfile ? (
            <div className="space-y-6">
              {/* User Profile View */}
              <div className="relative h-64 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl overflow-hidden">
                {selectedUserProfile.coverPicture && (
                  <img 
                    src={selectedUserProfile.coverPicture} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/30"></div>
                <button
                  onClick={() => setSelectedUserProfile(null)}
                  className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ←
                </button>
                <div className="absolute bottom-6 left-6 flex items-end gap-4">
                  <div className="w-24 h-24 bg-white rounded-full border-4 border-white overflow-hidden">
                    {selectedUserProfile.profilePicture ? (
                      <img src={selectedUserProfile.profilePicture} alt={selectedUserProfile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-slate-500 font-bold text-2xl">{selectedUserProfile.displayName.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{selectedUserProfile.displayName}</h3>
                    <p className="text-lg opacity-90">{selectedUserProfile.bloodType} • {selectedUserProfile.status}</p>
                  </div>
                </div>
                {/* Floating Chat Button on Profile */}
                <button
                  onClick={() => {
                    setSelectedChatUser(selectedUserProfile);
                    setShowChatInterface(true);
                  }}
                  className="absolute bottom-6 right-6 w-12 h-12 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4">{t('personalInfo')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('name')}:</span>
                      <span className="font-medium">{selectedUserProfile.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('email')}:</span>
                      <span className="font-medium">{selectedUserProfile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('bloodType')}:</span>
                      <span className="font-bold text-red-600">{selectedUserProfile.bloodType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('gender')}:</span>
                      <span className="font-medium capitalize">{selectedUserProfile.gender || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('whatsappNumber')}:</span>
                      <span className="font-medium">{selectedUserProfile.whatsappNumber || t('noWhatsappProvided')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('evcNumber')}:</span>
                      <span className="font-medium">{selectedUserProfile.evcNumber || t('none')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('status')}:</span>
                      <span className="font-medium capitalize">{selectedUserProfile.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('rating')}:</span>
                      <span className="font-medium">{selectedUserProfile.rating || 5.0} ⭐</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-4">Activity</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Member since:</span>
                      <span className="font-medium">Recently joined</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last donation:</span>
                      <span className="font-medium">{selectedUserProfile.lastDonationDate ? new Date(selectedUserProfile.lastDonationDate).toLocaleDateString() : 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last checkup:</span>
                      <span className="font-medium">{selectedUserProfile.lastCheckupDate ? new Date(selectedUserProfile.lastCheckupDate).toLocaleDateString() : 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((u) => (
                <div 
                  key={u.uid} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all cursor-pointer group"
                  onClick={() => setSelectedUserProfile(u)}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full mx-auto mb-4 overflow-hidden group-hover:scale-105 transition-transform">
                      {u.profilePicture ? (
                        <img src={u.profilePicture} alt={u.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-500 font-bold text-2xl">{u.displayName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{u.displayName}</h3>
                    <p className="text-sm text-red-600 font-bold mb-2">{u.bloodType}</p>
                    <p className="text-xs text-slate-500 mb-3">{u.email}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-slate-500 capitalize">{u.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && user.email === 'tayib4986@gmail.com' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">All Blood Requests</h3>
            <div className="space-y-4">
              {adminRequests.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-slate-500">No requests found</p>
                </div>
              ) : (
                adminRequests.map((req) => (
                  <div key={req.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center font-bold text-red-600 text-sm">
                          {req.bloodType}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{req.hospitalName}</h4>
                          <p className="text-xs text-slate-500">{req.location}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        req.status === 'open' ? 'bg-green-100 text-green-700' :
                        req.status === 'matched' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                        req.status === 'paid' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1 mb-3">
                      <p><strong>Urgency:</strong> {req.urgency}</p>
                      <p><strong>Contact:</strong> {req.contactPhone || 'N/A'}</p>
                      <p><strong>WhatsApp:</strong> {req.contactWhatsApp || 'N/A'}</p>
                      <p><strong>Created:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleAdminRequestStatus(req.id, 'open')}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleAdminRequestStatus(req.id, 'matched')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700"
                      >
                        Matched
                      </button>
                      <button
                        onClick={() => handleAdminRequestStatus(req.id, 'completed')}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700"
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => handleAdminRequestStatus(req.id, 'paid')}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-yellow-700"
                      >
                        Paid
                      </button>
                      <button
                        onClick={() => handleAdminRequestStatus(req.id, 'cancelled')}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900">User Management</h3>
                <p className="text-sm text-slate-500">Adjust points, ban/unban accounts, or remove users.</p>
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                {adminUsers.length} users
              </span>
            </div>
            <div className="space-y-4">
              {adminUsers.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-slate-500">No users available</p>
                </div>
              ) : (
                adminUsers.map((adminUser) => (
                  <div key={adminUser.uid} className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr] items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-900">{adminUser.displayName}</p>
                      <p className="text-xs text-slate-500">{adminUser.email}</p>
                      <p className="text-xs text-slate-500">{adminUser.role === 'admin' ? 'Admin' : 'User'}</p>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><span className="font-semibold">Blood:</span> {adminUser.bloodType}</p>
                      <p><span className="font-semibold">Points:</span> {adminUser.points || 0}</p>
                      <p><span className="font-semibold">Status:</span> {adminUser.status}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleAdjustUserPoints(adminUser.uid, 1)}
                        className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        +1 point
                      </button>
                      <button
                        onClick={() => handleAdjustUserPoints(adminUser.uid, -1)}
                        className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        -1 point
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {adminUser.email !== 'tayib4986@gmail.com' && (
                        <button
                          onClick={() => handleBanUser(adminUser.uid, adminUser.status !== 'banned')}
                          className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${adminUser.status === 'banned' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {adminUser.status === 'banned' ? 'Unban' : 'Ban'}
                        </button>
                      )}
                      {adminUser.status === 'banned' && (
                        <a
                          href="https://wa.me/252771641609"
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {t('contactSupport')}
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteUser(adminUser.uid)}
                        className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface Modal */}
      {showChatInterface && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowChatInterface(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex"
          >
            {/* Conversations List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Messages</h3>
                  <button
                    onClick={() => setShowChatInterface(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {chatConversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting with users!</p>
                  </div>
                ) : (
                  chatConversations.map((conv) => {
                    const otherUserId = conv.participants.find(id => id !== user.uid)!;
                    const otherUser = users.find(u => u.uid === otherUserId);
                    return (
                      <div
                        key={conv.id}
                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                          selectedChatUser?.uid === otherUserId ? 'bg-red-50 border-r-2 border-r-red-600' : ''
                        }`}
                        onClick={() => {
                          if (otherUser) {
                            handleOpenConversation(otherUser);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center overflow-hidden">
                            {otherUser?.profilePicture ? (
                              <img src={otherUser.profilePicture} alt={otherUser.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-red-600 font-bold">{otherUser?.displayName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{otherUser?.displayName}</p>
                            <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(conv.lastMessageTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChatUser ? (
                <>
                  <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center overflow-hidden">
                      {selectedChatUser.profilePicture ? (
                        <img src={selectedChatUser.profilePicture} alt={selectedChatUser.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-red-600 font-bold text-sm">{selectedChatUser.displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{selectedChatUser.displayName}</h4>
                      <p className="text-xs text-slate-500">{selectedChatUser.bloodType}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.senderUid === user.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                            msg.senderUid === user.uid 
                              ? 'bg-red-600 text-white' 
                              : 'bg-slate-100 text-slate-900'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showRequestForm && (
          <RequestFormModal
            user={user}
            onClose={() => { setShowRequestForm(false); setEditingRequest(null); }}
            editingRequest={editingRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestFormModal({ user, onClose, editingRequest }: { user: UserProfile, onClose: () => void, editingRequest?: BloodRequest | null }) {
  const [bloodType, setBloodType] = React.useState<BloodType>(editingRequest?.bloodType || user.bloodType);
  const [hospital, setHospital] = React.useState(editingRequest?.hospitalName || '');
  const [location, setLocation] = React.useState(editingRequest?.location || '');
  const [urgency, setUrgency] = React.useState<RequestUrgency>(editingRequest?.urgency || 'medium');
  const [senderPhone, setSenderPhone] = React.useState(editingRequest?.senderPhone || '');
  const [contactWhatsApp, setContactWhatsApp] = React.useState(editingRequest?.contactWhatsApp || '');
  const [contactPhone, setContactPhone] = React.useState(editingRequest?.contactPhone || '');
  const [loading, setLoading] = React.useState(false);
  const { t } = useLanguage();

  const formRef = React.useRef<HTMLFormElement>(null);
  const fieldRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const [currentFieldIndex, setCurrentFieldIndex] = React.useState(0);

  const fields = [
    'bloodType',
    'urgency',
    'hospital',
    'location',
    'senderPhone',
    'contactPhone',
    'contactWhatsApp'
  ];

  const focusField = (index: number) => {
    const field = fieldRefs.current[fields[index]];
    if (field) {
      field.focus();
      setCurrentFieldIndex(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const activeIndex = fields.findIndex((field) => fieldRefs.current[field] === document.activeElement);
    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      const nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % fields.length;
      focusField(nextIndex);
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      const prevIndex = activeIndex === -1 ? fields.length - 1 : (activeIndex - 1 + fields.length) % fields.length;
      focusField(prevIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRequest && (user.points || 0) <= 0) {
      alert('You need points to post. Please check your Profile Tab and message +252771641609 on WhatsApp to top-up (Minimum 4 Points / $2.00).');
      return;
    }

    setLoading(true);
    try {
      if (editingRequest) {
        await updateDoc(doc(db, 'requests', editingRequest.id), {
          bloodType,
          hospitalName: hospital,
          location,
          urgency,
          senderPhone,
          contactWhatsApp,
          contactPhone,
        });
      } else {
        await addDoc(collection(db, 'requests'), {
          recipientUid: user.uid,
          bloodType,
          hospitalName: hospital,
          location,
          urgency,
          status: 'open',
          createdAt: new Date().toISOString(),
          paymentPhone: '252617498686',
          senderPhone,
          contactWhatsApp,
          contactPhone,
        });

        await updateDoc(doc(db, 'users', user.uid), {
          points: Math.max((user.points || 0) - 1, 0),
        });
      }
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
            <h2 className="text-2xl font-bold text-slate-900">{editingRequest ? t('editRequest') : t('postBloodRequest')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Plus className="w-6 h-6 rotate-45 text-slate-400" />
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-bold">{t('importantNotice')}</p>
              <p className="opacity-90">{t('feeNotice')}</p>
            </div>
          </div>

          <form ref={formRef} onKeyDown={handleKeyDown} onSubmit={handleSubmit} className="space-y-4">
            {(!editingRequest && (user.points || 0) <= 0) && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-700">
                You need points to post a request. Please go to your <strong>Profile Tab</strong> and contact <a href="https://wa.me/252771641609" target="_blank" rel="noreferrer" className="font-bold text-red-700">+252771641609</a> on WhatsApp to top-up (Minimum <strong>4 Points</strong> / <strong>$2.00</strong>).
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('bloodType')}</label>
                <select 
                  ref={(el) => { fieldRefs.current['bloodType'] = el; }}
                  data-field="bloodType"
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
                  ref={(el) => { fieldRefs.current['urgency'] = el; }}
                  data-field="urgency"
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
                  ref={(el) => { fieldRefs.current['hospital'] = el; }}
                  data-field="hospital"
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
                  ref={(el) => { fieldRefs.current['location'] = el; }}
                  data-field="location"
                  required
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('location')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('senderPhone')}</label>
                <input
                  ref={(el) => { fieldRefs.current['senderPhone'] = el; }}
                  data-field="senderPhone"
                  required
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder={t('senderPhonePlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('callPhone')}</label>
                <input
                  ref={(el) => { fieldRefs.current['contactPhone'] = el; }}
                  data-field="contactPhone"
                  required
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t('callPhonePlaceholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('whatsappNumber')}</label>
              <input
                ref={(el) => { fieldRefs.current['contactWhatsApp'] = el; }}
                data-field="contactWhatsApp"
                required
                type="tel"
                value={contactWhatsApp}
                onChange={(e) => setContactWhatsApp(e.target.value)}
                placeholder={t('whatsappNumberPlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading || (!editingRequest && (user.points || 0) <= 0)}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-100 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('posting') : (editingRequest ? t('updateRequest') : t('postRequest'))}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
