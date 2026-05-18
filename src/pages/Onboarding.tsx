import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Camera, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

export default function Onboarding({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    birthday: '',
    gender: 'male' as const,
    bio: '',
    occupation: '',
    interests: [] as string[],
    photoURLs: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80']
  });

  const nextStep = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    
    const profile: UserProfile = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email!,
      displayName: formData.displayName,
      birthday: formData.birthday,
      gender: formData.gender,
      bio: formData.bio,
      occupation: formData.occupation,
      interests: formData.interests,
      photoURLs: formData.photoURLs,
      isPremium: false,
      isVerified: false,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await setDoc(doc(db, 'users', auth.currentUser.uid), profile);
    onComplete(profile);
  };

  const INTERESTS_OPTIONS = ['Travel', 'Art', 'Fitness', 'Music', 'Coding', 'Gaming', 'Cooking', 'Hiking', 'Photography', 'Movies'];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col p-10 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full" />
      
      <div className="mb-16 relative z-10">
        <div className="flex gap-2 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              i <= step ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-white/5"
            )} />
          ))}
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
          {step === 1 && "Start your story."}
          {step === 2 && "The details matter."}
          {step === 3 && "Vibe check."}
          {step === 4 && "The first impression."}
        </h2>
        <p className="text-zinc-500 mt-2 text-sm uppercase tracking-widest font-bold font-mono">
           Step {step} of 4
        </p>
      </div>

      <div className="flex-1 relative z-10">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-12">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Display Name</label>
              <input
                autoFocus
                className="w-full bg-transparent border-b border-white/10 text-4xl font-bold py-4 outline-none focus:border-pink-500 transition-all text-white placeholder:text-zinc-800"
                placeholder="How should we call you?"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Birthday</label>
              <input
                type="date"
                className="w-full bg-transparent border-b border-white/10 text-4xl font-bold py-4 outline-none focus:border-pink-500 transition-all text-white inverted-colors"
                value={formData.birthday}
                onChange={e => setFormData({...formData, birthday: e.target.value})}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">I am a...</label>
              <div className="flex gap-3">
                {['male', 'female', 'other'].map(g => (
                  <button
                    key={g}
                    onClick={() => setFormData({...formData, gender: g as any})}
                    className={cn(
                      "flex-1 py-4 rounded-2xl border text-sm font-bold capitalize transition-all",
                      formData.gender === g 
                        ? "bg-white text-black border-white" 
                        : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 block">Bio</label>
              <textarea
                className="w-full bg-white/5 rounded-3xl p-6 min-h-[160px] outline-none border border-white/10 focus:border-pink-500/50 transition-all text-white placeholder:text-zinc-700 text-sm leading-relaxed"
                placeholder="The world is your oyster. Tell us your vibe..."
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-3">
            {INTERESTS_OPTIONS.map(interest => {
              const selected = formData.interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => {
                    const newInterests = selected 
                      ? formData.interests.filter(i => i !== interest)
                      : [...formData.interests, interest];
                    setFormData({...formData, interests: newInterests});
                  }}
                  className={cn(
                    "px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all",
                    selected 
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 border-transparent shadow-lg shadow-pink-500/20 text-white" 
                      : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                  )}
                >
                  {interest}
                </button>
              );
            })}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <div className="w-full max-w-[280px] aspect-[3/4] bg-zinc-900 rounded-[40px] overflow-hidden relative group border border-white/10 shadow-2xl">
              <img src={formData.photoURLs[0]} className="w-full h-full object-cover grayscale-[0.2]" />
              <button className="absolute bottom-6 right-6 bg-white text-black p-4 rounded-3xl shadow-xl active:scale-90 transition-transform">
                <Camera size={24} />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-white font-bold pointer-events-none">Preview</div>
            </div>
            <p className="text-zinc-500 mt-10 text-center text-xs leading-relaxed max-w-[200px]">
              High quality photos significantly increase your match rate.
            </p>
          </motion.div>
        )}
      </div>

      <div className="mt-auto relative z-10 pt-10">
        <button
          onClick={step === 4 ? handleSubmit : nextStep}
          disabled={step === 1 && !formData.displayName}
          className="w-full btn-primary py-5 rounded-[24px] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 group"
        >
          {step === 4 ? (
            <>
              Enter Experience <Sparkles size={18} className="translate-y-[-1px]" />
            </>
          ) : (
            <>
              Continue <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
