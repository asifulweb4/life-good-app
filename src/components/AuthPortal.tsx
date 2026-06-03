import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Mail, Phone, User as UserIcon, LogIn, UserPlus, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

interface AuthPortalProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referCode, setReferCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const url = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin
      ? { email, password }
      : { name, phone, email, password, referCode };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'অনাকাঙ্ক্ষিত সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }

      setSuccessMsg(data.message || 'সফল হয়েছে!');
      
      // Delay slightly for visual feedback
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-purple-50 to-white" id="auth-portal">
      {/* Background glowing blobs */}
      <div className="absolute top-24 left-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-2xl shadow-purple-100/80 z-10 relative"
      >
        {/* Brand identity */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-700 to-pink-500 items-center justify-center text-white font-black text-xl shadow-lg shadow-pink-200 mb-3 animate-pulse" style={{ animationDuration: '3s' }}>
            LG
          </div>
          <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-pink-600">
            LIFE GOOD
          </h2>
          <p className="text-[10px] text-purple-600 font-extrabold uppercase tracking-widest mt-1">
            Online Micro-Earnings & Resell
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1 bg-pink-50 text-pink-700 text-[10px] sm:text-xs font-bold py-1 px-3 rounded-full border border-pink-100">
            <Sparkles size={12} className="animate-spin text-pink-500" style={{ animationDuration: '4s' }} />
            শতভাগ হালাল উপায়ে অনলাইন ইনকাম প্ল্যাটফর্ম
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 bg-purple-50 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              isLogin ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-500 hover:text-purple-800'
            }`}
          >
            <LogIn size={14} /> লগইন করুন
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
              !isLogin ? 'bg-white text-purple-950 shadow-sm' : 'text-purple-500 hover:text-purple-800'
            }`}
          >
            <UserPlus size={14} /> নতুন একাউন্ট
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Full name */}
                <div>
                  <label className="text-[11px] font-bold text-purple-900 block mb-1">আপনার পূর্ণ নাম</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400">
                      <UserIcon size={14} />
                    </span>
                    <input
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: আসাফুল ইসলাম"
                      className="w-full text-xs bg-purple-50/50 border border-purple-100 focus:border-pink-300 rounded-xl py-2.5 pl-9 pr-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="text-[11px] font-bold text-purple-900 block mb-1">মোবাইল নাম্বার</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400 font-mono text-xs">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      required={!isLogin}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="w-full text-xs bg-purple-50/50 border border-purple-100 focus:border-pink-300 rounded-xl py-2.5 pl-9 pr-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email / Phone */}
          <div>
            <label className="text-[11px] font-bold text-purple-900 block mb-1">
              {isLogin ? 'ইমেইল বা ফোন নম্বর' : 'ইমেইল এড্রেস'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400">
                <Mail size={14} />
              </span>
              <input
                type={isLogin ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isLogin ? "asiful@example.com বা 017XXXXXXXX" : "asiful@example.com"}
                className="w-full text-xs bg-purple-50/50 border border-purple-100 focus:border-pink-300 rounded-xl py-2.5 pl-9 pr-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-400 font-medium font-mono"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-bold text-purple-900 block mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400">
                <KeyRound size={14} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full text-xs bg-purple-50/50 border border-purple-100 focus:border-pink-300 rounded-xl py-2.5 pl-9 pr-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="refer-code"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Refer code */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-purple-900 block">রেফার কোড (ঐচ্ছিক)</label>
                    <span className="text-[9px] font-extrabold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full">+৫০.০০ ৳ বোনাস</span>
                  </div>
                  <input
                    type="text"
                    value={referCode}
                    onChange={(e) => setReferCode(e.target.value)}
                    placeholder="যেমন: LG-99221"
                    className="w-full text-xs bg-purple-50/50 border border-purple-100 focus:border-pink-300 rounded-xl py-2.5 px-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-400 font-mono"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-headShake">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles size={14} className="shrink-0 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-pink-100 hover:opacity-95 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              <>লগইন করুন</>
            ) : (
              <>রেজিস্ট্রেশন করুন</>
            )}
          </button>
        </form>

        {/* Footer info card */}
        <div className="mt-6 pt-4 border-t border-purple-50 flex items-start gap-2.5 text-gray-500 text-[10px] leading-relaxed">
          <HelpCircle size={14} className="text-purple-400 shrink-0 mt-0.5" />
          <p>
            লাইফ গুড এ নিবন্ধন সম্পূর্ণ করলে আপনি পাচ্ছেন <strong>২৫০ ৳ ইনস্ট্যান্ট সাইনআপ বোনাস</strong> সরাসরি আপনার মেইন ওয়ালেটে। কাজ শুরু করুন ও রিয়েল ইনকাম ক্লেইম করুন!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
