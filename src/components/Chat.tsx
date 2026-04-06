import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChatMessage, UserProfile } from '../types';

interface ChatProps {
  currentUser: UserProfile;
  targetUser: UserProfile;
  onClose: () => void;
}

export default function Chat({ currentUser, targetUser, onClose }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
        .filter(
          m => (m.senderUid === currentUser.uid && m.receiverUid === targetUser.uid) ||
               (m.senderUid === targetUser.uid && m.receiverUid === currentUser.uid)
        );
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [currentUser.uid, targetUser.uid]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await addDoc(collection(db, 'messages'), {
      senderUid: currentUser.uid,
      receiverUid: targetUser.uid,
      message: input,
      timestamp: serverTimestamp(),
      read: false,
      participants: [currentUser.uid, targetUser.uid],
    });
    setInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative flex flex-col h-[80vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-600 font-bold text-lg">×</button>
        <h2 className="text-xl font-bold mb-4 text-slate-900">Chat with {targetUser.displayName}</h2>
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 bg-slate-50 p-3 rounded-xl">
          {loading ? (
            <div className="text-center text-slate-400">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400">No messages yet.</div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.senderUid === currentUser.uid ? 'bg-red-100 ml-auto text-right' : 'bg-white mr-auto text-left border border-slate-100'}`}
              >
                {msg.message}
                <div className="text-[10px] text-slate-400 mt-1">{msg.timestamp && (typeof msg.timestamp === 'string' ? new Date(msg.timestamp).toLocaleTimeString() : '')}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-all">Send</button>
        </form>
      </div>
    </div>
  );
}
