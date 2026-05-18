import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Match, UserProfile } from '../types';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function Matches({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'matches'),
      where('users', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const matchData = await Promise.all(snap.docs.map(async d => {
        const data = d.data() as Match;
        const otherUserId = data.users.find(u => u !== auth.currentUser?.uid);
        const userSnap = await getDoc(doc(db, 'users', otherUserId!));
        return {
          ...data,
          id: d.id,
          otherUser: userSnap.data() as UserProfile
        };
      }));
      setMatches(matchData.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Connections</h2>
        <div className="relative group">
          <Search size={18} className="text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-pink-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search matches" 
            className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-xs w-48 focus:ring-1 focus:ring-pink-500/50 outline-none transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* New Matches Row */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">New Matches</h3>
          <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2.5 py-0.5 rounded-full font-bold border border-pink-500/30">12 New</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {matches.map(match => (
            <motion.button
              key={match.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectChat(match.id)}
              className="flex-shrink-0 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-pink-500 to-purple-500 shadow-lg shadow-pink-500/10">
                <div className="w-full h-full rounded-2xl border-2 border-black overflow-hidden bg-zinc-900">
                   <img src={match.otherUser?.photoURLs[0]} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-400">{match.otherUser?.displayName.split(' ')[0]}</span>
            </motion.button>
          ))}
          {matches.length === 0 && (
             <div className="w-16 h-20 bg-white/5 border border-white/10 border-dashed rounded-2xl flex items-center justify-center text-zinc-700 text-xl font-bold">+</div>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Recent Messages</h3>
        {matches.map(match => (
          <motion.button
            key={match.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectChat(match.id)}
            className="w-full flex items-center gap-4 p-3 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-[24px] transition-all group"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/10 relative">
               <img src={match.otherUser?.photoURLs[0]} className="w-full h-full object-cover" />
               <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#050505] rounded-full" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="flex justify-between items-center mb-0.5">
                 <h4 className="font-bold text-sm text-gray-100">{match.otherUser?.displayName}</h4>
                 <span className="text-[10px] text-gray-500">{match.lastMessageAt ? formatDistanceToNow(match.lastMessageAt) : ''}</span>
              </div>
              <p className={cn(
                "text-xs truncate",
                !match.lastMessage ? "text-pink-400 font-medium" : "text-gray-400"
              )}>
                {match.lastMessage || `You matched! Say hi to ${match.otherUser?.displayName.split(' ')[0]}`}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
