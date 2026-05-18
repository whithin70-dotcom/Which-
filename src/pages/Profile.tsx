import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { 
  Settings, 
  Camera, 
  MapPin, 
  Briefcase, 
  Cake as BirthdayCake, 
  Verified, 
  Crown, 
  LogOut, 
  ChevronRight,
  Shield,
  CreditCard
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile({ profile }: { profile: UserProfile }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="h-full flex flex-col p-6 bg-black overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Profile</h2>
        <button className="p-2 bg-zinc-900 rounded-xl text-zinc-400">
           <Settings size={20} />
        </button>
      </div>

      {/* User Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative mb-4">
           <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-pink-500/20 p-1">
              <img src={profile.photoURLs[0]} className="w-full h-full object-cover rounded-[1.8rem]" />
           </div>
           <button className="absolute -bottom-2 -right-2 bg-pink-500 p-3 rounded-2xl border-4 border-black text-white hover:scale-110 transition-transform">
              <Camera size={20} />
           </button>
           {profile.isVerified && (
             <div className="absolute top-0 right-0 bg-blue-500 p-1.5 rounded-full border-4 border-black text-white">
                <Shield size={14} fill="currentColor" />
             </div>
           )}
        </div>
        <h3 className="text-2xl font-bold mb-1">{profile.displayName}</h3>
        <p className="text-zinc-500 font-medium">{profile.occupation || 'Wanderer'}</p>
      </div>

      {/* Premium Card */}
      {!profile.isPremium && (
        <motion.div 
          whileTap={{ scale: 0.98 }}
          className="mb-8 p-6 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-3xl relative overflow-hidden group cursor-pointer"
        >
           <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Crown size={64} className="text-purple-400" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-purple-400">
                 <Crown size={20} />
                 <span className="font-black text-sm uppercase tracking-widest">Get Premium</span>
              </div>
              <p className="text-zinc-300 text-sm mb-4 max-w-[200px]">Unlimited swipes, see who liked you, and prioritize your profile!</p>
              <button className="bg-white text-black text-xs font-bold px-6 py-2 rounded-full active:scale-95 transition-transform">
                 UPGRADE NOW
              </button>
           </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
         <StatBox label="Likes" value={24} />
         <StatBox label="Matches" value={8} />
         <StatBox label="Rank" value="#12" />
      </div>

      {/* Profile Details */}
      <div className="space-y-4 mb-10">
         <ProfileItem icon={<MapPin size={18} />} label="Location" value="San Francisco, CA" />
         <ProfileItem icon={<Briefcase size={18} />} label="Occupation" value={profile.occupation || 'N/A'} />
         <ProfileItem icon={<BirthdayCake size={18} />} label="Birthday" value={new Date(profile.birthday).toLocaleDateString()} />
         <ProfileItem icon={<Crown size={18} />} label="Membership" value={profile.isPremium ? 'Premium' : 'Standard'} />
      </div>

      <div className="space-y-3">
         <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest px-2">Interests</h4>
         <div className="flex flex-wrap gap-2">
            {profile.interests.map(i => (
               <span key={i} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-medium text-zinc-300 hover:border-pink-500/50 transition-colors">
                  {i}
               </span>
            ))}
         </div>
      </div>

      <button 
        onClick={handleLogout}
        className="mt-12 w-full flex items-center justify-center gap-2 text-red-500 bg-red-500/10 py-4 rounded-2xl font-bold active:scale-95 transition-transform"
      >
        <LogOut size={20} /> Logout
      </button>

      <div className="h-20" />
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl flex flex-col items-center">
       <span className="text-xl font-bold text-white mb-1">{value}</span>
       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl group cursor-pointer hover:border-zinc-800 transition-colors">
       <div className="text-zinc-500 group-hover:text-pink-500 transition-colors">{icon}</div>
       <div className="flex-1">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</p>
          <p className="text-sm font-medium">{value}</p>
       </div>
       <ChevronRight size={16} className="text-zinc-700" />
    </div>
  );
}
