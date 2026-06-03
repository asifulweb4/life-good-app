/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, LogIn, TrendingUp, RefreshCw, Calendar, ArrowUpRight, AlertCircle, Sparkles, CheckCircle2, Copy, PlusCircle } from 'lucide-react';
import { Transaction, EarningsState } from '../types';

interface WalletPanelProps {
  earnings: EarningsState;
  onWithdrawSubmitted: (amount: number, method: string, recipient: string) => void;
  onDepositSubmitted: (amount: number, method: string, sender: string, transactionId: string) => Promise<boolean>;
}

export default function WalletPanel({ earnings, onWithdrawSubmitted, onDepositSubmitted }: WalletPanelProps) {
  const currentBalance = Number(earnings?.currentBalance || 0);
  const todayEarnings = Number(earnings?.todayEarnings || 0);
  const yesterdayEarnings = Number(earnings?.yesterdayEarnings || 0);
  const last7DaysEarnings = Number(earnings?.last7DaysEarnings || 0);
  const totalEarnings = Number(earnings?.totalEarnings || 0);
  const transactionsList = Array.isArray(earnings?.transactions) ? earnings.transactions : [];

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [method, setMethod] = useState<'Bkash' | 'Nagad' | 'Rocket'>('Bkash');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [cashoutError, setCashoutError] = useState('');
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  // Deposit States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depMethod, setDepMethod] = useState<'Bkash' | 'Nagad' | 'Rocket'>('Bkash');
  const [depSender, setDepSender] = useState('');
  const [depAmount, setDepAmount] = useState('');
  const [depTrxId, setDepTrxId] = useState('');
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmt = Number(amount);

    if (!recipient || recipient.length < 11) {
      setCashoutError('📞 অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন।');
      return;
    }

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      setCashoutError('৳ সঠিক উইথড্রয়াল অ্যামাউন্ট প্রদান করুন।');
      return;
    }

    if (withdrawAmt < 250) {
      setCashoutError('⚠️ সর্বনিম্ন উইথড্রয়াল অ্যামাউন্ট ২৫০ ৳ হতে হবে।');
      return;
    }

    if (withdrawAmt > currentBalance) {
      setCashoutError('❌ আপনার পর্যাপ্ত ব্যালেন্স নেই! বর্তমান ব্যালেন্স চেক করুন।');
      return;
    }

    onWithdrawSubmitted(withdrawAmt, method, recipient);
    setCashoutSuccess(true);
    setCashoutError('');
  };

  const handleDepositRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmt = Number(depAmount);

    if (!depSender || depSender.length < 11) {
      setDepositError('📞 অনুগ্রহ করে সঠিক ১১ ডিজিটের প্রেরক নাম্বার দিন।');
      return;
    }

    if (isNaN(depositAmt) || depositAmt <= 0) {
      setDepositError('৳ সঠিক ডিপোজিট অ্যামাউন্ট প্রদান করুন।');
      return;
    }

    if (depositAmt < 10) {
      setDepositError('⚠️ সর্বনিম্ন ডিপোজিট অ্যামাউন্ট ১০ ৳ হতে হবে।');
      return;
    }

    if (!depTrxId.trim()) {
      setDepositError('🔑 অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setDepositError('');
    const success = await onDepositSubmitted(depositAmt, depMethod, depSender, depTrxId.trim());
    if (success) {
      setDepositSuccess(true);
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return <span className="text-[10px] sm:text-xs font-bold text-center px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">সফল</span>;
      case 'pending':
        return <span className="text-[10px] sm:text-xs font-bold text-center px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full shrink-0">পেন্ডিং</span>;
      default:
        return <span className="text-[10px] sm:text-xs font-bold text-center px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full shrink-0">ব্যর্থ</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6" id="wallet-panel">
      {/* Wallet Balance Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white border border-white/20">
            <Wallet size={28} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs uppercase font-extrabold tracking-wider opacity-85">আপনার বর্তমান ব্যালেন্স</span>
            <p className="text-3xl sm:text-4xl font-black text-yellow-300">
              {currentBalance.toFixed(2)} ৳
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowDepositModal(true);
              setDepositSuccess(false);
              setDepAmount('');
              setDepSender('');
              setDepTrxId('');
              setDepositError('');
            }}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-purple-950 font-extrabold text-xs sm:text-sm tracking-wide rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
            id="deposit-trigger-btn"
          >
            <PlusCircle size={16} /> টাকা ডিপোজিট করুন
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowWithdrawModal(true);
              setCashoutSuccess(false);
              setAmount('');
              setRecipient('');
              setCashoutError('');
            }}
            className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-purple-950 font-extrabold text-xs sm:text-sm tracking-wide rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
            id="withdraw-trigger-btn"
          >
            <Wallet size={16} /> উইথড্র বা ক্যাশআউট
          </motion.button>
        </div>
      </div>

      {/* Grid of multi-time metrics stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="wallet-stats-grid">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100/60 shadow-md shadow-purple-50 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase">আজকের ইনকাম</span>
          <p className="text-xl font-black text-purple-950 mt-1">{todayEarnings.toFixed(2)} ৳</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp size={10} /> Active
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100/60 shadow-md shadow-purple-50 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase">গতকালকের ইনকাম</span>
          <p className="text-xl font-black text-gray-800 mt-1">{yesterdayEarnings.toFixed(2)} ৳</p>
          <span className="text-[10px] text-gray-500 font-medium mt-2">Yesterday Ledger</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100/60 shadow-md shadow-purple-50 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-gray-500 uppercase">গত ৭ দিনের ইনকাম</span>
          <p className="text-xl font-black text-purple-900 mt-1">{last7DaysEarnings.toFixed(2)} ৳</p>
          <span className="text-[10px] text-purple-600 font-bold mt-2">Rolling 7-day</span>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-purple-100/60 shadow-md shadow-purple-50 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-gray-400 uppercase">টোটাল অর্জিত ইনকাম</span>
          <p className="text-xl font-black text-pink-600 mt-1">{totalEarnings.toFixed(2)} ৳</p>
          <span className="text-[10px] text-pink-600 font-bold mt-2">Lifetime Total</span>
        </div>
      </div>

      {/* Transaction ledger panel list */}
      <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 sm:p-6 shadow-xl shadow-purple-50" id="ledger-history-panel">
        <h3 className="text-lg font-black text-purple-950 flex items-center gap-2 mb-4 border-b border-purple-50 pb-3">
          <LogIn size={18} className="translate-y-0.5" />
          ইনকাম হিস্ট্রি ও ট্রানজেকশন খতিয়ান
        </h3>

        {transactionsList.length > 0 ? (
          <div className="divide-y divide-purple-50 space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
            {transactionsList.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between pt-3.5 first:pt-0 gap-4"
                id={`transaction-log-${t.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${t.type === 'earning'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    <ArrowUpRight size={18} className={t.type === 'withdrawal' ? 'rotate-90' : ''} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 text-sm leading-tight">
                      {t.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-mono">
                      <Calendar size={10} />
                      {t.date}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 font-mono">
                  <p className={`font-black text-sm ${t.type === 'earning' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                    {t.type === 'earning' ? '+' : '-'}{Number(t.amount).toFixed(2)} ৳
                  </p>
                  {getStatusBadge(t.status)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400">ব্যালেন্স হিস্ট্রি ও লেনদেনের সঠিক তালিকা এখানে পাওয়া যাবে।</p>
          </div>
        )}
      </div>

      {/* Cashout dialog Overlay */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-purple-950/45 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-purple-100/80 flex flex-col max-h-[90vh]"
              id="withdraw-modal-flow"
            >
              {/* Box title frame */}
              <div className="p-4 bg-gradient-to-r from-purple-700 to-pink-500 text-white flex justify-between items-center">
                <span className="font-bold text-base flex items-center gap-1.5">
                  <Wallet size={16} /> লাইভ পেমেন্ট উইথড্রয়াল প্যানেল
                </span>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-grow">
                {cashoutSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-emerald-800">পেমেন্ট রিকোয়েস্ট সফল হয়েছে!</h3>
                      <p className="text-xs text-purple-600 mt-0.5">পদ্ধতি: {method} • প্রাপক: {recipient}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-widest block mb-0.5">
                        প্রসেসিং অ্যামাউন্ট
                      </span>
                      <p className="text-2xl font-black text-purple-900">{amount} ৳</p>
                    </div>

                    <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                      আমাদের পেমেন্ট অপারেটর আপনার রিকোয়েস্টটি যাচাই করে আগামী ৪-১২ ঘণ্টার মধ্যে আপনার {method} নাম্বারে টাকা পাঠিয়ে দিবে।
                    </p>

                    <button
                      onClick={() => setShowWithdrawModal(false)}
                      className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-full transition-colors"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleWithdrawRequest} className="space-y-4">
                    {/* Active balance layout info */}
                    <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-pink-700 uppercase">উদ্ধারযোগ্য ওয়ালেট ব্যালেন্স</span>
                        <p className="text-xl font-black text-pink-600 mt-0.5">{currentBalance.toFixed(2)} ৳</p>
                      </div>
                      <Sparkles className="text-pink-500 animate-spin" style={{ animationDuration: '6s' }} size={18} />
                    </div>

                    {/* Method selecting structure */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1.5">উইথড্রয়ার মাধ্যম নির্বাচন করুন</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Bkash', 'Nagad', 'Rocket'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m)}
                            className={`py-2 px-3 rounded-xl font-bold text-sm border text-center transition-all ${method === m
                                ? 'bg-purple-700 border-purple-700 text-white shadow-md shadow-purple-50'
                                : 'bg-purple-50/50 hover:bg-purple-50 border-purple-100 text-purple-900'
                              }`}
                          >
                            {m === 'Bkash' ? 'বিকাশ (Bkash)' : m === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number block */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1">১১ ডিজিটের পার্সোনাল নাম্বার</label>
                      <input
                        type="tel"
                        required
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="উদাঃ 01XXXXXXXXX"
                        className="w-full text-sm bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                      />
                    </div>

                    {/* Cash size block */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1">উইথড্রয়েল অ্যামাউন্ট (৳)</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="সর্বনিম্ন ২৫০ ৳ এবং সর্বোচ্চ ব্যালেন্স পর্যন্ত"
                        className="w-full text-sm bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 font-bold text-pink-600 focus:outline-none"
                      />
                    </div>

                    {/* Notification info */}
                    {cashoutError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{cashoutError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-pink-100 transition-all cursor-pointer"
                    >
                      রিকোয়েস্ট সাবমিট করুন
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deposit modal Overlay */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 bg-purple-950/45 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-purple-100/80 flex flex-col max-h-[90vh]"
              id="deposit-modal-flow"
            >
              <div className="p-4 bg-gradient-to-r from-purple-700 to-pink-500 text-white flex justify-between items-center select-none">
                <span className="font-bold text-base flex items-center gap-1.5 font-sans">
                  <Sparkles size={16} className="text-yellow-300 animate-pulse" /> কম টাকায় ইনস্ট্যান্ট ডিপোজিট করুন
                </span>
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-grow">
                {depositSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-amber-800">আবেদন সফলভাবে পাঠানো হয়েছে!</h3>
                      <p className="text-xs text-purple-600 mt-0.5">পদ্ধতি: {depMethod} • প্রেরক: {depSender}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                      <span className="text-xs font-bold text-purple-700 uppercase block mb-0.5">
                        ডিপোজিট আবেদন অ্যামাউন্ট
                      </span>
                      <p className="text-2xl font-black text-amber-600">{depAmount} ৳</p>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      আপনার ডিপোজিট আবেদনটি সফলভাবে সাবমিট হয়েছে এবং অবস্থা পেন্ডিং রয়েছে। ট্রানজেকশন (TrxID) মিলিয়ে এডমিন যাচাই করার পর ওয়ালেটে টাকা যোগ হবে (সাধারণত ৫-১০ মিনিট সময় লাগবে)।
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowDepositModal(false)}
                      className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-full transition-colors"
                    >
                      ড্যাশবোর্ডে ফিরে যান
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDepositRequest} className="space-y-4">
                    {/* Minimum deposit notice */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100/65 rounded-2xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">বিশেষ অফার ও সুযোগ</span>
                        <p className="text-xs font-semibold text-purple-900 leading-snug">
                          খুবই কম টাকায় মাত্র <span className="text-pink-600 font-extrabold text-sm font-mono">১০ ৳</span> ডিপোজিট করেই কাজ শুরু করতে পারবেন!
                        </p>
                      </div>
                      <Sparkles className="text-purple-600 shrink-0" size={20} />
                    </div>

                    {/* Method Selecting */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1.5">আপনার পেমেন্ট মেথড নির্বাচন করুন</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Bkash', 'Nagad', 'Rocket'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setDepMethod(m)}
                            className={`py-2 px-1 rounded-xl font-bold text-xs border text-center transition-all ${depMethod === m
                                ? 'bg-purple-700 border-purple-700 text-white shadow-md'
                                : 'bg-purple-50/50 hover:bg-purple-50 border-purple-100 text-purple-900'
                              }`}
                          >
                            {m === 'Bkash' ? 'বিকাশ (bKash)' : m === 'Nagad' ? 'নগদ (Nagad)' : 'রকেট (Rocket)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Instruction */}
                    <div className="p-3.5 bg-yellow-50/80 border border-yellow-250/50 rounded-xl space-y-1 text-xs">
                      <p className="text-amber-900 font-bold flex items-center gap-1 leading-none">
                        📢 টাকা পাঠানোর নিয়ম:
                      </p>
                      <p className="text-gray-700 leading-normal">
                        নিচে দেওয়া {depMethod === 'Bkash' ? 'বিকাশ' : depMethod === 'Nagad' ? 'নগদ' : 'রকেট'} পার্সোনাল নাম্বারে টাকা <span className="font-extrabold text-pink-600">Send Money</span> অথবা <span className="font-extrabold text-pink-600">ক্যাশ ইন</span> করুন। নিচে সঠিক তথ্য দিয়ে ফর্মটি জমা দিন।
                      </p>
                      <div className="mt-2 p-2 bg-white rounded-lg border border-yellow-150 flex justify-between items-center gap-1 font-mono">
                        <div>
                          <span className="text-[10px] text-gray-505 block uppercase font-bold text-gray-500">আমাদের {depMethod === 'Bkash' ? 'বিকাশ' : depMethod === 'Nagad' ? 'নগদ' : 'রকেট'} নাম্বার</span>
                          <span className="text-sm font-black text-purple-950 font-sans">
                            {depMethod === 'Bkash' ? '' : depMethod === 'Nagad' ? '01804624046' : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const num = depMethod === 'Bkash' ? '' : depMethod === 'Nagad' ? '01804624046' : '';
                            navigator.clipboard.writeText(num);
                            alert('নাম্বারটি কপি করা হয়েছে!');
                          }}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded hover:bg-purple-100 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Copy size={10} /> কপি করুন
                        </button>
                      </div>
                    </div>

                    {/* Sender block */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1">১১ ডিজিটের প্রেরক নাম্বার (যে নাম্বার থেকে টাকা পাঠিয়েছেন)</label>
                      <input
                        type="tel"
                        required
                        value={depSender}
                        onChange={(e) => setDepSender(e.target.value)}
                        placeholder="উদাঃ 01XXXXXXXXX"
                        className="w-full text-sm bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none focus:ring-1 focus:ring-purple-300"
                      />
                    </div>

                    {/* Amount block */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1">পাঠানো টাকার পরিমাণ (৳ - সর্বনিম্ন ১০ ৳)</label>
                      <input
                        type="number"
                        required
                        value={depAmount}
                        onChange={(e) => setDepAmount(e.target.value)}
                        placeholder="৳ উদাঃ ৫০ বা ১০০"
                        className="w-full text-sm bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 font-bold text-pink-600 focus:outline-none focus:ring-1 focus:ring-purple-300"
                      />
                    </div>

                    {/* Transaction ID block */}
                    <div>
                      <label className="text-[11px] font-bold text-purple-900 block mb-1">ট্রানজেকশন আইডি (bKash/Nagad TrxID)</label>
                      <input
                        type="text"
                        required
                        value={depTrxId}
                        onChange={(e) => setDepTrxId(e.target.value)}
                        placeholder="উদাঃ 8K3M9P0Q"
                        className="w-full text-sm bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 font-bold font-mono focus:outline-none uppercase focus:ring-1 focus:ring-purple-300"
                      />
                    </div>

                    {/* Notification info */}
                    {depositError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{depositError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-purple-700 hover:opacity-95 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-purple-100 transition-all cursor-pointer"
                    >
                      ডিপোজিট বিবরণ জমা দিন
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
