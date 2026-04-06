import React from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { DonationRecord, UserProfile } from '../types';
import { CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface DonationTrackerProps {
  user: UserProfile;
}

export default function DonationTracker({ user }: DonationTrackerProps) {
  const [donations, setDonations] = React.useState<DonationRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useLanguage();

  React.useEffect(() => {
    if (!user.uid) return;

    const donorQuery = query(
      collection(db, 'donations'),
      where('donorUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const recipientQuery = query(
      collection(db, 'donations'),
      where('recipientUid', '==', user.uid),
      where('status', '==', 'pending')
    );

    const mergeSnapshot = (docs: any[]) => {
      const unique = new Map<string, DonationRecord>();
      docs.forEach((doc) => {
        unique.set(doc.id, doc as DonationRecord);
      });
      setDonations(Array.from(unique.values()));
      setLoading(false);
    };

    const unsubscribers = [
      onSnapshot(donorQuery, (snapshot) => {
        mergeSnapshot(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DonationRecord)));
      }, (error) => {
        console.error('DonationTracker snapshot error (donor):', error);
        setLoading(false);
      }),
      onSnapshot(recipientQuery, (snapshot) => {
        mergeSnapshot(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DonationRecord)));
      }, (error) => {
        console.error('DonationTracker snapshot error (recipient):', error);
        setLoading(false);
      }),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user.uid]);

  const handleConfirm = async (donation: DonationRecord, isDonor: boolean) => {
    try {
      const donationRef = doc(db, 'donations', donation.id);
      const update: any = {};
      
      if (isDonor) {
        update.donorConfirmed = true;
      } else {
        update.recipientConfirmed = true;
      }

      const currentData = (await getDoc(donationRef)).data() as DonationRecord;
      if ((isDonor && currentData.recipientConfirmed) || (!isDonor && currentData.donorConfirmed)) {
        update.status = 'completed';
        const reqRef = doc(db, 'requests', donation.requestId);
        await updateDoc(reqRef, { status: 'completed' });
        const donorRef = doc(db, 'users', donation.donorUid);
        await updateDoc(donorRef, { lastDonationDate: new Date().toISOString() });
      }

      await updateDoc(donationRef, update);
    } catch (err) {
      console.error("Error confirming donation:", err);
    }
  };

  if (donations.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        {t('pendingConfirmations')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {donations.map((donation) => {
          const isDonor = donation.donorUid === user.uid;
          const hasConfirmed = isDonor ? donation.donorConfirmed : donation.recipientConfirmed;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={donation.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID: {donation.id.slice(-6)}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">
                  {isDonor ? t('confirmHandshake') : t('confirmHandshake')}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isDonor ? t('donorQuestion') : t('recipientQuestion')}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  disabled={hasConfirmed}
                  onClick={() => handleConfirm(donation, isDonor)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    hasConfirmed 
                      ? 'bg-green-50 text-green-600 cursor-default'
                      : 'bg-slate-900 text-white hover:bg-red-600 shadow-lg shadow-slate-100'
                  }`}
                >
                  {hasConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t('confirmed')}
                    </>
                  ) : (
                    t('confirmHandshake')
                  )}
                </button>
                
                {!hasConfirmed && (
                  <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
