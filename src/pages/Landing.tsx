import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, Chrome } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-[20px] flex items-center justify-center font-bold text-3xl italic shadow-2xl shadow-pink-500/20">n</div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-3">
            not alone<span className="text-pink-500">.</span>
          </h1>
          <p className="text-zinc-500 font-medium uppercase tracking-[0.3em] text-[10px]">AI-Powered Dating</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4.5 pl-14 pr-4 focus:ring-1 focus:ring-pink-500/50 outline-none transition-all placeholder:text-zinc-700 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-pink-500 transition-colors" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-[24px] py-4.5 pl-14 pr-4 focus:ring-1 focus:ring-pink-500/50 outline-none transition-all placeholder:text-zinc-700 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-[10px] uppercase font-bold text-center tracking-widest">{error}</p>}

          <button
            type="submit"
            className="w-full btn-primary py-4.5 rounded-[24px] font-bold text-sm tracking-wide uppercase mt-4"
          >
            {isLogin ? 'Sign In' : 'Join Now'}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
            <span className="bg-[#050505] px-4 text-zinc-600">secure connect</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full bg-white/5 border border-white/10 text-white font-bold py-4.5 rounded-[24px] flex items-center justify-center gap-3 active:scale-95 transition-all text-sm hover:bg-white/10"
        >
          <Chrome size={20} className="text-white" />
          Google Account
        </button>

        <p className="mt-12 text-center text-zinc-600 text-[11px] font-medium uppercase tracking-widest">
          {isLogin ? "New to the experience?" : "Already part of us?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-pink-500 font-bold hover:text-pink-400 transition-colors ml-1"
          >
            {isLogin ? 'Join' : 'Log In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
