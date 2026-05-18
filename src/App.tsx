import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  User as UserIcon, 
  Settings, 
  Sparkles,
  Search,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { cn } from './lib/utils';

// Pages
import Landing from './pages/Landing';
import Discovery from './pages/Discovery';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/Admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'profile' | 'admin'>('discover');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-pink-500 font-bold text-4xl italic"
        >
          not alone
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (user && !profile) {
    return <Onboarding onComplete={(p) => setProfile(p)} />;
  }

  return (
    <div className="h-screen w-full bg-[#050505] text-white relative overflow-hidden flex flex-col">
      {/* Mobile Header */}
      <header className="h-16 flex items-center justify-between px-8 bg-black/40 border-b border-white/5 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg italic shadow-lg shadow-pink-500/20">n</div>
          <h1 className="text-xl font-semibold tracking-tight">
            not alone<span className="text-pink-500">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {profile?.isAdmin && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={cn("p-2 rounded-xl transition-colors", activeTab === 'admin' ? "bg-white/10 text-pink-500" : "text-zinc-500 hover:text-white")}
            >
              <ShieldCheck size={20} />
            </button>
          )}
          <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#050505]" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <Discovery profile={profile!} />
            </motion.div>
          )}

          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              {selectedChat ? (
                <Chat matchId={selectedChat} onBack={() => setSelectedChat(null)} />
              ) : (
                <Matches onSelectChat={setSelectedChat} />
              )}
            </motion.div>
          )}

          {activeTab === 'admin' && (
             <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto px-6"
             >
                <AdminDashboard />
             </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              <Profile profile={profile!} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="h-20 bg-black/80 border-t border-white/5 flex items-center justify-around px-8 z-50 backdrop-blur-xl">
        <NavButton 
          active={activeTab === 'discover'} 
          onClick={() => { setActiveTab('discover'); setSelectedChat(null); }} 
          icon={<Search size={22} />} 
        />
        <NavButton 
          active={activeTab === 'matches'} 
          onClick={() => setActiveTab('matches')} 
          icon={<MessageCircle size={22} />} 
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => { setActiveTab('profile'); setSelectedChat(null); }} 
          icon={<UserIcon size={22} />} 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-white" : "text-zinc-600 hover:text-zinc-400"
      )}
    >
      <div className={cn(
        "p-2 rounded-[14px] transition-all",
        active ? "bg-white/10 shadow-lg shadow-white/5 scale-110" : ""
      )}>
        {icon}
      </div>
      {active && (
        <motion.div 
          layoutId="tab-indicator"
          className="w-1.5 h-1.5 bg-pink-500 rounded-full"
        />
      )}
    </button>
  );
}
