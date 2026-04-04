import React from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { UserProfile, DonationRecord } from '../types';
import { AlertCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface ComplaintFormProps {
  user: UserProfile;
  donation: DonationRecord;
  onClose: () => void;
}

export default function ComplaintForm({ user, donation, onClose }: ComplaintFormProps) {
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        reporterUid: user.uid,
        targetUid: user.uid === donation.donorUid ? donation.recipientUid : donation.donorUid,
        donationId: donation.id,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      console.error("Error filing complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('fileComplaint')}</h2>
          <p className="text-sm text-slate-500 mt-1">{t('complaintSubtext')}</p>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-xs text-amber-800">
          <p className="font-bold mb-1">{t('investigationPolicy')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('complaintReason')}</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('complaintReason')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none min-h-[120px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !reason}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? t('submitting') : (
              <>
                <Send className="w-4 h-4" />
                {t('fileComplaint')}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
