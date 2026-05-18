import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, limit, doc, getDoc } from 'firebase/firestore';
import { UserProfile, Swipe } from '../types';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Heart, X, Star, Info, Sparkles, ShieldCheck, MapPin, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Discovery({ profile }: { profile: UserProfile }) {
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        limit(50)
      );
      const snap = await getDocs(q);
      const users = snap.docs
        .map(d => d.data() as UserProfile)
        .filter(u => u.uid !== auth.currentUser?.uid);
      
      setCandidates(users);

      // Get AI Recommendations
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: profile, otherProfiles: users })
      });
      const recs = await res.json();
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [profile]);

  const [showMatch, setShowMatch] = useState<UserProfile | null>(null);

  const handleSwipe = async (type: 'like' | 'nope' | 'superlike') => {
    if (currentIndex >= candidates.length) return;
    
    const targetUser = candidates[currentIndex];
    
    // Save swipe
    await addDoc(collection(db, 'swipes'), {
      fromUid: auth.currentUser?.uid,
      toUid: targetUser.uid,
      type,
      createdAt: Date.now()
    });

    // Check for match
    if (type === 'like' || type === 'superlike') {
      const q = query(
        collection(db, 'swipes'),
        where('fromUid', '==', targetUser.uid),
        where('toUid', '==', auth.currentUser?.uid),
        where('type', 'in', ['like', 'superlike'])
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Create match
        await addDoc(collection(db, 'matches'), {
          users: [auth.currentUser?.uid, targetUser.uid],
          createdAt: Date.now(),
        });
        setShowMatch(targetUser);
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) return <div className="h-full flex items-center justify-center">Loading discover...</div>;

  const currentCandidate = candidates[currentIndex];
  const rec = recommendations.find(r => r.uid === currentCandidate?.uid);

  return (
    <div className="h-full flex flex-col p-4 relative">
      <AnimatePresence>
        {showMatch && (
           <MatchModal user={showMatch} profile={profile} onClose={() => setShowMatch(null)} />
        )}
      </AnimatePresence>
      <div className="flex-1 relative">
        <AnimatePresence>
          {currentCandidate ? (
            <SwipeCard 
              key={currentCandidate.uid}
              user={currentCandidate}
              recommendation={rec}
              onSwipe={handleSwipe}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
              <Sparkles size={48} className="text-zinc-800" />
              <p>No more candidates for now</p>
              <button 
                onClick={() => setCurrentIndex(0)}
                className="text-pink-500 font-bold"
              >
                Reset Search
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-24 flex items-center justify-center gap-6 px-4">
        <button 
          onClick={() => handleSwipe('nope')}
          className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-red-500 border border-zinc-800 shadow-xl"
        >
          <X size={28} />
        </button>
        <button 
           onClick={() => handleSwipe('superlike')}
           className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-blue-400 border border-zinc-800 shadow-xl"
        >
          <Star size={24} fill="currentColor" />
        </button>
        <button 
          onClick={() => handleSwipe('like')}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/20"
        >
          <Heart size={28} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function SwipeCard({ user, recommendation, onSwipe }: { user: UserProfile, recommendation?: any, onSwipe: (type: 'like' | 'nope' | 'superlike') => void | Promise<void>, key?: any }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  return (
    <div className="absolute inset-x-0 inset-y-8 group">
      {/* Background stack effect */}
      <div className="absolute inset-0 translate-y-4 scale-[0.98] bg-white/5 rounded-[40px] border border-white/5" />
      
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) onSwipe('like');
          else if (info.offset.x < -100) onSwipe('nope');
        }}
        className="absolute inset-0 bg-zinc-900 rounded-[40px] overflow-hidden shadow-2xl touch-none border border-white/10"
      >
        <img src={user.photoURLs[0]} className="w-full h-full object-cover pointer-events-none" />
        
        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />
        
        {/* AI Compatibility Tag */}
        <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center gap-2 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wide uppercase">
            AI Match: {recommendation?.matchPercentage || '90'}%
          </span>
        </div>

        <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-4xl font-bold">{user.displayName}, {new Date().getFullYear() - new Date(user.birthday).getFullYear()}</h2>
            {user.isVerified && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                 <ShieldCheck size={12} className="text-white" fill="currentColor" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-gray-300 text-sm mb-6">
            <span className="flex items-center gap-1 opacity-70">
              <MapPin size={14} /> 2km away
            </span>
            <span className="flex items-center gap-1 opacity-70">
              <Briefcase size={14} /> {user.occupation || 'Creative'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map(i => (
               <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-300">
                  {i}
               </span>
            ))}
          </div>
        </div>

        {/* Like / Nope indicators */}
        <motion.div style={{ opacity: likeOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-green-500 text-green-500 px-8 py-4 rounded-3xl font-black text-6xl -rotate-12 uppercase">
          Like
        </motion.div>
        <motion.div style={{ opacity: nopeOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-red-500 text-red-500 px-8 py-4 rounded-3xl font-black text-6xl rotate-12 uppercase">
          Nope
        </motion.div>
      </motion.div>
    </div>
  );
}

function MatchModal({ user, profile, onClose }: { user: UserProfile, profile: UserProfile, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl"
    >
       <motion.div
         initial={{ scale: 0.5, y: 100 }}
         animate={{ scale: 1, y: 0 }}
         className="relative mb-8"
       >
          <div className="text-4xl font-black italic bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-8">
             It's a Match!
          </div>
          <div className="flex gap-4 items-center justify-center">
             <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden -rotate-12">
                <img src={profile.photoURLs[0]} className="w-full h-full object-cover" />
             </div>
             <Heart size={48} className="text-pink-500 fill-pink-500 animate-pulse" />
             <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden rotate-12">
                <img src={user.photoURLs[0]} className="w-full h-full object-cover" />
             </div>
          </div>
       </motion.div>
       
       <p className="text-zinc-300 mb-12 max-w-xs">
          You and {user.displayName} have liked each other. Why not say hello?
       </p>

       <div className="w-full space-y-4">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold active:scale-95 transition-transform"
          >
             Send a Message
          </button>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-bold active:scale-95 transition-transform border border-zinc-800"
          >
             Keep Swiping
          </button>
       </div>
    </motion.div>
  );
}
