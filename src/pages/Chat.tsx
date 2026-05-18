import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  getDoc,
  setDoc
} from 'firebase/firestore';
import { Message, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Sparkles, Image as ImageIcon, Phone, Video, Bot, X as XIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Chat({ matchId, onBack }: { matchId: string, onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      const matchSnap = await getDoc(doc(db, 'matches', matchId));
      if (matchSnap.exists()) {
        const otherUserId = matchSnap.data().users.find((u: string) => u !== auth.currentUser?.uid);
        const userSnap = await getDoc(doc(db, 'users', otherUserId));
        setOtherUser(userSnap.data() as UserProfile);
      }
    };
    fetchMatch();

    const q = query(
      collection(db, 'matches', matchId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');

    await addDoc(collection(db, 'matches', matchId, 'messages'), {
      senderId: auth.currentUser?.uid,
      text,
      createdAt: Date.now(),
      read: false
    });

    await setDoc(doc(db, 'matches', matchId), {
      lastMessage: text,
      lastMessageAt: Date.now()
    }, { merge: true });
  };

  const getAIAdvice = async () => {
    if (showAI) {
      setShowAI(false);
      return;
    }

    setAiLoading(true);
    setShowAI(true);
    try {
      const res = await fetch('/api/ai/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputText || "",
          context: { 
            lastMessages: messages.slice(-5).map(m => ({
              text: m.text,
              sender: m.senderId === auth.currentUser?.uid ? 'me' : 'them'
            })),
            matchProfile: otherUser
          }
        })
      });
      const data = await res.json();
      setAiAdvice(data.text || "I'm drawing a blank. Maybe try a simple 'How's your day?'");
    } catch (e) {
      console.error(e);
      setAiAdvice("My sensors are a bit fuzzy. Let's try again in a bit!");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Chat Header */}
      <header className="p-4 bg-black/40 border-b border-white/5 backdrop-blur-md flex items-center gap-4 z-10">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-white/10 relative">
            <img src={otherUser?.photoURLs[0]} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-100">{otherUser?.displayName}</h4>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active now</span>
          </div>
        </div>
        <div className="flex gap-4 text-zinc-400">
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors"><Phone size={18} /></button>
          <button className="p-2 hover:bg-white/5 rounded-xl transition-colors"><Video size={18} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === auth.currentUser?.uid;
          return (
            <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
               <motion.div 
                 initial={{ scale: 0.95, opacity: 0, y: 10 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 className={cn(
                   "max-w-[80%] px-5 py-3.5 rounded-[24px] text-sm leading-relaxed shadow-lg",
                   isMe ? "bg-gradient-to-tr from-pink-500 to-purple-600 text-white rounded-tr-none shadow-pink-500/10" : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                 )}
               >
                 {msg.text}
               </motion.div>
               <span className="text-[9px] mt-1.5 text-zinc-600 font-bold uppercase tracking-widest px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* AI Advice Panel */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="mx-4 mb-4 p-5 bg-pink-500/10 border border-pink-500/20 rounded-[32px] backdrop-blur-xl relative card-shadow"
          >
            <button onClick={() => setShowAI(false)} className="absolute top-4 right-4 text-pink-500/50 hover:text-pink-500 transition-colors">
               <XIcon size={16} />
            </button>
            <div className="flex items-center gap-2 mb-3 text-pink-500 font-black text-[10px] uppercase tracking-[0.2em]">
               <Sparkles size={14} /> AI Wingman
            </div>
            {aiLoading ? (
              <div className="space-y-2">
                 <div className="h-2 w-full bg-pink-500/20 rounded-full animate-pulse" />
                 <div className="h-2 w-2/3 bg-pink-500/20 rounded-full animate-pulse" />
              </div>
            ) : (
              <p className="text-sm text-pink-100 leading-relaxed italic">"{aiAdvice}"</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 bg-black/40 border-t border-white/5 pb-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors"><ImageIcon size={22} /></button>
          <div className="flex-1 bg-white/5 rounded-full flex items-center px-5 py-2.5 border border-white/10 group focus-within:border-pink-500/50 transition-all">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none outline-none text-sm py-1 placeholder:text-zinc-600"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={getAIAdvice}
              className={cn("p-1.5 rounded-full transition-all", showAI ? "bg-pink-500 text-white" : "text-zinc-600 hover:text-pink-500")}
            >
              <Bot size={20} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 active:scale-95 transition-all disabled:opacity-30"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
