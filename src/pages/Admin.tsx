import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { Users, AlertTriangle, TrendingUp, DollarSign, Search, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMatches: 0,
    reports: 0,
    revenue: 0
  });

  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Dummy stats for demo
      setStats({
        totalUsers: 1240,
        activeMatches: 450,
        reports: 12,
        revenue: 4500
      });

      const q = query(collection(db, 'users'), limit(5));
      const snap = await getDocs(q);
      setRecentUsers(snap.docs.map(d => d.data() as UserProfile));
    };
    fetchData();
  }, []);

  return (
    <div className="py-6 space-y-8">
      <div className="flex items-center gap-3">
         <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-500">
            <ShieldCheck size={28} />
         </div>
         <div>
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-zinc-500 text-sm">Welcome back, Super Admin</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <AdminStat label="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users size={20} />} color="bg-blue-500" />
         <AdminStat label="New Reports" value={stats.reports} icon={<AlertTriangle size={20} />} color="bg-red-500" />
         <AdminStat label="Matches" value={stats.activeMatches} icon={<TrendingUp size={20} />} color="bg-green-500" />
         <AdminStat label="Revenue" value={`$${stats.revenue}`} icon={<DollarSign size={20} />} color="bg-yellow-500" />
      </div>

      <div>
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Recent Signups</h3>
            <button className="text-sm text-pink-500 font-bold">View All</button>
         </div>
         <div className="space-y-3">
            {recentUsers.map(u => (
               <div key={u.uid} className="bg-zinc-900/50 p-4 rounded-2xl flex items-center gap-4 border border-zinc-900">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800">
                     <img src={u.photoURLs[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-sm">{u.displayName}</h4>
                     <p className="text-[10px] text-zinc-500 uppercase font-black">{u.email}</p>
                  </div>
                  <div className="px-3 py-1 bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400">
                     USER
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
         <h3 className="font-bold mb-2">Content Moderation</h3>
         <p className="text-zinc-500 text-sm mb-4">Our AI currently scanning 124 images for safety compliance.</p>
         <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '65%' }}
               className="h-full bg-pink-500"
            />
         </div>
         <p className="mt-2 text-[10px] text-zinc-600 font-bold">65% SCANNED</p>
      </div>
    </div>
  );
}

function AdminStat({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl group hover:border-pink-500/30 transition-colors">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-lg", color)}>
          {icon}
       </div>
       <p className="text-2xl font-bold mb-1">{value}</p>
       <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}
