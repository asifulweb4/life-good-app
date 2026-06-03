/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, LayoutGrid, Award, Briefcase, PhoneCall, PlusCircle, BookOpen, Building2, Gift,
  CheckCircle2, AlertCircle, ShoppingBag, X, TrendingUp, Sparkles, Send, ShieldAlert, Heart
} from 'lucide-react';
import { DriveOffer } from '../types';

interface HomePanelProps {
  walletBalance: number;
  onUpdateTab: (tab: string) => void;
  onRegisterCommission: (amount: number, description: string) => void;
  onDonationSubmitted: (amount: number) => void;
  driveOffers: DriveOffer[];
}

export default function HomePanel({
  walletBalance,
  onUpdateTab,
  onRegisterCommission,
  onDonationSubmitted,
  driveOffers
}: HomePanelProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Drive offers operators selector state
  const [selectedMobileOperator, setSelectedMobileOperator] = useState<'Robi' | 'Grameenphone' | 'Banglalink' | 'Airtel' | 'Teletalk'>('Robi');
  const [purchaseDriveSuccess, setPurchaseDriveSuccess] = useState<string | null>(null);

  // Donation state
  const [donationAmount, setDonationAmount] = useState<number>(50);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Job post state
  const [jobPostTitle, setJobPostTitle] = useState('');
  const [jobPostReward, setJobPostReward] = useState(1);
  const [jobPostQty, setJobPostQty] = useState(100);
  const [jobPostSuccess, setJobPostSuccess] = useState(false);

  const projects = [
    { id: 'ads', title: 'এডস মার্কেটিং', desc: 'ফ্রিতে ওয়েবসাইট নিয়ে ডলার ইনকাম', icon: Globe, color: 'from-purple-500 to-indigo-500' },
    { id: 'ecommerce', title: 'ই-কমার্স ওয়েবসাইট', desc: 'নিজস্ব স্টোরে প্রোডাক্ট বিক্রি করুন', icon: ShoppingBag, color: 'from-pink-500 to-rose-500' },
    { id: 'courses', title: 'ওয়েলকাম অফার', desc: '১০টি সেকশন ভিডিও দেখে ১০০০ ৳ লাভ', icon: Gift, color: 'from-purple-650 to-pink-550', redirectTab: 'welcome' },
    { id: 'salary', title: 'মাসিক বেতন', desc: 'লেভেল অনুযায়ী স্থায়ী মাসিক এলাউন্স', icon: Award, color: 'from-fuchsia-500 to-pink-500' },
    { id: 'microjob', title: 'মাইক্রো জব', desc: 'সোশ্যাল টাস্ক ফিনিশ করে নিশ্চিত আয়', icon: Briefcase, color: 'from-purple-600 to-pink-600', redirectTab: 'jobs' },
    { id: 'drive', title: 'ড্রাইভ অফার', desc: 'সব অপারেটরের অফার সেলে বড় কমিশন', icon: PhoneCall, color: 'from-rose-500 to-indigo-500' },
    { id: 'jobpost', title: 'জব পোস্ট', desc: 'আপনার নিজের কাজ সাবমিট করুন', icon: PlusCircle, color: 'from-pink-500 to-purple-600' },
    { id: 'service', title: 'ডিজিটাল সার্ভিস', desc: 'এনিমেশন ও এডিটিং প্রফেশনাল কোর্স', icon: BookOpen, color: 'from-indigo-500 to-purple-500' },
    { id: 'charity', title: 'ইউজার সংগঠন', desc: 'মানবকল্যাণে দান ও ফান্ড অ্যাক্টিভিটি', icon: Building2, color: 'from-purple-600 to-pink-500' }
  ];

  const handleTileClick = (proj: typeof projects[0]) => {
    if (proj.redirectTab) {
      onUpdateTab(proj.redirectTab);
    } else {
      setActiveModal(proj.id);
      setPurchaseDriveSuccess(null);
      setDonationSuccess(false);
      setJobPostSuccess(false);
    }
  };

  const handlePurchaseDrive = (offer: DriveOffer) => {
    if (walletBalance < offer.offerPrice) {
      alert(`⚠️ আপনার ব্যালেন্স অপর্যাপ্ত! অফারটির মূল্য ${offer.offerPrice} ৳ কিন্তু আপনার ব্যালেন্স ${walletBalance} ৳`);
      return;
    }
    // Deduct raw value and add back the commission instantly!
    const netDeduction = offer.offerPrice - offer.commission;
    onRegisterCommission(-netDeduction, `ড্রাইভ প্যাক ক্রয়: ${offer.title} (+${offer.commission} ৳ কমিশন ফেরত)`);
    setPurchaseDriveSuccess(offer.id);
  };

  const handleCharityDonation = () => {
    if (walletBalance < donationAmount) {
      alert('⚠️ অনুদান দিতে আপনার ব্যালেন্স অপর্যাপ্ত।');
      return;
    }
    onDonationSubmitted(donationAmount);
    setDonationSuccess(true);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = jobPostReward * jobPostQty;
    if (walletBalance < totalCost) {
      alert(`⚠️ জব পোস্ট করতে আপনার অপর্যাপ্ত ব্যালেন্স। মোট খরচ হবে ${totalCost} ৳`);
      return;
    }
    onRegisterCommission(-totalCost, `নতুন জব পোস্ট চার্জ: "${jobPostTitle}"`);
    setJobPostSuccess(true);
    setJobPostTitle('');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6" id="home-panel">
      {/* Dynamic welcome slider / Promo header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-550 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden select-none">
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/4 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div className="w-16 h-16 rounded-3xl bg-white/20 border border-white/25 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles size={32} className="text-yellow-250 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-white/25 border border-white/20 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
              🔥 LIVE PROMOTION
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">লাইফ গুড বিজনেস প্ল্যাটফর্ম</h1>
            <p className="text-sm opacity-90 max-w-xl font-medium">
              আপনার সফল ক্যারিয়ার ও অর্থ উপার্জনের স্থায়ী ঠিকানা। শতভাগ ইসলামিক শরীয়াহ সমর্থিত রিসেলিং এবং মাইক্রো জবসের দুনিয়ায় আপনাকে স্বাগতম!
            </p>
          </div>
        </div>

        <button
          onClick={() => onUpdateTab('welcome')}
          className="relative z-10 px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-purple-950 font-black text-sm rounded-2xl shadow-lg transition-transform cursor-pointer shrink-0"
        >
          ট্রেনিং শুরু করুন ➔
        </button>
      </div>

      {/* Grid of 9 Projects */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-purple-50 pb-2 select-none">
          <h2 className="text-base sm:text-lg font-black text-purple-950 flex items-center gap-1.5">
            <LayoutGrid size={18} /> লাইভ গুড প্রজেক্ট সমুহ (Live Services)
          </h2>
          <span className="text-[10px] bg-pink-100 text-pink-700 py-0.5 px-2 rounded-full font-bold select-none border border-pink-200">
            ৯ টি সক্রিয় ফিচারস
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" id="projects-grid">
          {projects.map((proj) => {
            const IconComponent = proj.icon;
            return (
              <motion.div
                key={proj.id}
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTileClick(proj)}
                className="bg-white/95 rounded-2xl border border-purple-100/70 p-4 sm:p-5 flex flex-col justify-between h-36 relative overflow-hidden shadow-sm hover:shadow-lg hover:shadow-pink-100/50 hover:border-pink-300 transition-all cursor-pointer group"
                id={`project-tile-${proj.id}`}
              >
                {/* Decorative floating blurred background bubble matching standard visual styling */}
                <div className={`absolute -right-3 -bottom-3 w-12 h-12 rounded-full bg-gradient-to-br ${proj.color} opacity-[0.08] group-hover:scale-150 transition-transform duration-300`}></div>

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${proj.color} flex items-center justify-center text-white shadow-md shadow-pink-100/20`}>
                  <IconComponent size={20} />
                </div>

                <div className="space-y-0.5 relative z-10">
                  <h3 className="font-extrabold text-purple-950 text-sm sm:text-base leading-tight">
                    {proj.title}
                  </h3>
                  <p className="text-[10px] text-purple-600 font-semibold line-clamp-1">
                    {proj.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Reseller Shop Banner block */}
      <div className="bg-gradient-to-tr from-pink-50 to-purple-50 rounded-3xl border border-purple-100/70 p-5 flex flex-col sm:flex-row justify-between items-center sm:gap-6 shadow-md shadow-purple-50 select-none">
        <div className="flex gap-4 items-center mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center shrink-0 border border-pink-200">
            <ShoppingBag size={22} className="animate-bounce" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h4 className="font-black text-purple-950 text-base">লাইভ গুড রিসেলার শপ</h4>
            <p className="text-xs text-purple-600">সবচেয়ে সেরা রেটে পাঞ্জাবি, টি-শার্ট ও শার্ট লভ্যাংশে সরাসরি রিসেল করুন</p>
          </div>
        </div>
        <button
          onClick={() => onUpdateTab('shop')}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shrink-0 cursor-pointer"
        >
          রিসেলিং শপ ভিজিট করুন
        </button>
      </div>

      {/* Modal overlays for standalone home projects */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-purple-950/45 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-purple-100"
              id="feature-modal-dialog"
            >
              {/* Title frame */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 to-pink-500 text-white flex justify-between items-center bg-clip-border">
                <span className="font-bold text-base flex items-center gap-1.5 uppercase">
                  ⭐ {projects.find((p) => p.id === activeModal)?.title} প্রজেক্ট
                </span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-white"
                >
                  ✕
                </button>
              </div>

              {/* Dynamic Inner views based on Modal ID */}
              <div className="p-5 overflow-y-auto max-h-[80vh] space-y-4 text-xs sm:text-sm">
                
                {/* 1. Ads Marketing */}
                {activeModal === 'ads' && (
                  <div className="space-y-4 leading-relaxed">
                    <img
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
                      alt="Ads Marketing"
                      className="w-full h-36 object-cover rounded-2xl"
                    />
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-purple-950 text-base">লাইভ ব্লগিং ও ১৫,০০০ ৳ মূল্যের ফ্রি নিজস্ব ওয়েবসাইট!</h3>
                      <p className="text-gray-600">আপনি কোম্পানির স্পেশাল কন্ডিশন ফুলফিল করার মাধ্যমে সম্পূর্ণ নিজের নামের সাথে মিল রেখে একটি নিউজ পোর্টাল ওয়েবসাইট পাবেন কোম্পানি থেকে বিনামূল্যে।</p>
                    </div>

                    <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl space-y-2">
                      <p className="font-bold text-pink-700 flex items-center gap-1"><CheckCircle2 size={14} /> ফ্রি ওয়েবসাইট পাওয়ার মূল শর্তসমূহ:</p>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>আপনার একাউন্টে কমপক্ষে ১০ জন সক্রিয় রেফারেল অ্যাকাউন্ট থাকতে হবে।</li>
                        <li>ট্রেনিং সেকশনের প্রথম ৪টি ভিডিও ভালোভাবে ফিনিশ করা থাকতে হবে।</li>
                        <li>কোম্পানি থেকে নিয়মিত কাজের অ্যাক্টিভিটি রিপোর্ট সাবমিট করতে হবে।</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => window.open('https://youtube.com', '_blank')}
                      className="w-full py-3 bg-purple-950 text-purple-200 text-sm font-bold rounded-xl mt-4 hover:bg-purple-900 transition-colors"
                    >
                      ওয়েবসাইট ডেমো দেখুন ➔
                    </button>
                  </div>
                )}

                {/* 2. E-commerce */}
                {activeModal === 'ecommerce' && (
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <img
                      src="https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=600&auto=format&fit=crop"
                      alt="Ecommerce"
                      className="w-full h-36 object-cover rounded-2xl"
                    />
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-purple-950 text-base">সহজ ই-কমার্স ওয়েবসাইট প্রজেক্ট</h3>
                      <p className="text-sm">নিজে প্রোডাক্ট রি-সেল বা সোর্সিং করার পাশাপাশি কাস্টম ই-কমার্স শপ হিসেবে ব্যবহার করতে পারবেন।</p>
                    </div>
                    <p className="text-xs bg-purple-50 p-3 rounded-xl border border-purple-100 text-purple-800">
                      💡 আপনি আপনার রিসেলার মার্জিন অনুযায়ী যেকোনো সোশ্যাল প্ল্যাটফর্ম বা নিজের ওয়েবসাইটে প্রোডাক্টের লিংক শেয়ার করে পেমেন্ট গেটওয়ের মাধ্যমে ডিরেক্ট ক্লায়েন্ট পেমেন্ট রিসিভ করতে পারবেন। ডেলিভারির দায়িত্ব সম্পূর্ণ কোম্পানির।
                    </p>
                  </div>
                )}

                {/* 4. Monthly Salary */}
                {activeModal === 'salary' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-purple-950 block">আপনার বর্তমান র্যাঙ্ক স্ট্যাটাস</span>
                        <p className="text-lg font-black text-purple-900">লেভেল ১ (নতুন পার্টনার)</p>
                      </div>
                      <Award size={32} className="text-pink-500 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-purple-950">স্যালারি বা বেতনের লেভেলসমূহ:</h4>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar text-xs">
                        <div className="flex justify-between p-2.5 bg-purple-50/50 border border-purple-150 rounded-xl">
                          <span>Bronze Rank (৫ জন সক্রিয় ভেরিফাইড ইউজার)</span>
                          <span className="font-extrabold text-pink-600">১,৫০০ ৳/মাস</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-purple-50/50 border border-purple-150 rounded-xl">
                          <span>Silver Rank (২৫ জন সক্রিয় ভেরিফাইড ইউজার)</span>
                          <span className="font-extrabold text-pink-600">৫,০০০ ৳/মাস</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-purple-50/50 border border-purple-150 rounded-xl">
                          <span>Gold Rank (১০০ জন সক্রিয় ভেরিফাইড ইউজার)</span>
                          <span className="font-extrabold text-pink-600">১৫,০০০ ৳/মাস</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-gradient-to-r from-pink-50 to-purple-50 p-2.5 border border-pink-200 rounded-xl font-bold">
                          <span>Diamond Rank (৫০০ জন সক্রিয় ইউজার)</span>
                          <span className="font-extrabold text-purple-700">৫০,০০০ ৳/মাস</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Drive Offer */}
                {activeModal === 'drive' && (
                  <div className="space-y-4">
                    {/* Operator selector horizontal */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0 select-none">
                      {(['Robi', 'Grameenphone', 'Banglalink', 'Airtel', 'Teletalk'] as const).map((op) => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setSelectedMobileOperator(op)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                            selectedMobileOperator === op
                              ? 'bg-purple-700 text-white shadow'
                              : 'bg-purple-50 text-purple-950 hover:bg-purple-100 border border-purple-100'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                      {driveOffers
                        .filter((offer) => offer.provider === selectedMobileOperator)
                        .map((offer) => (
                          <div
                            key={offer.id}
                            className="p-4 bg-purple-50/40 border border-purple-150 rounded-2xl flex flex-col justify-between hover:shadow transition-shadow gap-3"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-bold text-purple-950 text-sm">{offer.title}</h4>
                                <span className="text-[10px] text-purple-600 bg-white border border-purple-100 px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold">
                                  ভ্যালিডিটি: {offer.validity}
                                </span>
                              </div>
                              <span className="text-xs font-extrabold text-pink-600 font-mono shrink-0">
                                প্রফিট: {offer.commission} ৳
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs border-t border-purple-100/50 pt-2.5">
                              <div>
                                <span className="text-gray-500 mr-2.5">দাম: <del className="font-mono">{offer.regularPrice} ৳</del></span>
                                <span className="font-extrabold text-purple-900 font-mono">অফার স্পেশাল: {offer.offerPrice} ৳</span>
                              </div>

                              {purchaseDriveSuccess === offer.id ? (
                                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 border border-emerald-150 px-3 py-1 rounded-full">
                                  <CheckCircle2 size={12} /> সফল ক্রয়!
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePurchaseDrive(offer)}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-sm"
                                >
                                  কিনুন
                                </button>
                              )}
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Job Post */}
                {activeModal === 'jobpost' && (
                  <div className="space-y-4">
                    {jobPostSuccess ? (
                      <div className="text-center py-5 space-y-3 bg-emerald-50 border border-emerald-150 rounded-2xl p-4">
                        <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
                        <h4 className="font-bold text-emerald-800 text-sm">জবটি সফলভাবে পোস্ট করা হয়েছে!</h4>
                        <p className="text-xs text-purple-750">
                          আপনার জবটি ভেরিফিকেশন প্যানেলে পাঠানো হয়েছে। শীঘ্রই কাজটির এপ্রুভালের সাথে সাথে মাইক্রো টাস্ক লিস্টে লাইভ হয়ে যাবে।
                        </p>
                        <button
                          type="button"
                          onClick={() => setJobPostSuccess(false)}
                          className="px-5 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-bold inline-block"
                        >
                          আরেকটি পোস্ট করুন
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handlePostJob} className="space-y-4">
                        <p className="text-xs text-purple-600">
                          আপনার কোনো ইউটিউব/ফেসবুক বা সোশ্যাল প্রমোশনের প্রয়োজন থাকলে আপনার অ্যাকাউন্ট ব্যালেন্স চার্জ করে সহজেই একটি মাইক্রো বিজ্ঞাপনী জব করতে পারবেন।
                        </p>

                        <div>
                          <label className="text-[11px] font-bold text-purple-900 block mb-1">জবের মূল টাইটেল</label>
                          <input
                            type="text"
                            required
                            value={jobPostTitle}
                            onChange={(e) => setJobPostTitle(e.target.value)}
                            placeholder="উদাঃ আমার ফেসবুক পেজে লাইক দিতে হবে"
                            className="w-full text-xs bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-purple-900 block mb-1">প্রতি কাজের বোনাস (৳)</label>
                            <input
                              type="number"
                              required
                              value={jobPostReward}
                              onChange={(e) => setJobPostReward(Number(e.target.value))}
                              placeholder="১-৫ ৳"
                              className="w-full text-xs bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-purple-900 block mb-1">কাজের পরিমাণ (Qty)</label>
                            <input
                              type="number"
                              required
                              value={jobPostQty}
                              onChange={(e) => setJobPostQty(Number(e.target.value))}
                              placeholder="উদাঃ ১০০টি"
                              className="w-full text-xs bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs flex justify-between items-center">
                          <span className="font-bold text-purple-950">টোটাল জব পোস্ট চার্জ:</span>
                          <span className="font-black text-pink-600 font-mono">{jobPostReward * jobPostQty} ৳</span>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
                        >
                          কনফার্ম জব পাবলিশ করুন
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 8. Digital Service */}
                {activeModal === 'service' && (
                  <div className="space-y-4">
                    <p className="text-xs text-purple-600 leading-normal">
                      লাইভ গুড স্টুডেন্টদের প্রফেশনাল স্কিল ডেভেলপমেন্টের জন্য নিচের এক্সক্লুসিভ ডিজিটাল কোর্স ও সার্ভিসসমূহ অ্যাক্সেস করতে পারবেন:
                    </p>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar text-xs sm:text-sm">
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl relative">
                        <h4 className="font-bold text-purple-950">২ডি/৩ডি এনিমেশন কার্টুন মেকিং ফুল ভিডিও কোর্স</h4>
                        <p className="text-xs text-gray-500 mt-0.5">মোবাইলের সাহায্যে কার্টুন ব্যাকগ্রাউন্ড তৈরি, এনিমেশন ভয়েস ডাবিং এবং ইউটিউব ভিডিও মেকিং ফুল গাইড।</p>
                        <span className="absolute right-3 top-3 px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-[9px] font-bold">ম্যাট্রিকুলেটেড</span>
                      </div>

                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl">
                        <h4 className="font-bold text-purple-950 text-gray-400">প্রফেশনাল ফটো ও ভিডিও এডিটিং কোর্স (ক্যাপকাট)</h4>
                        <p className="text-xs text-gray-500 mt-0.5">অফিসিয়াল শর্টস ও ভিডিও এডিটিং টুলস সেটআপ।</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">শীঘ্রই আসছে</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. User Organization Charity */}
                {activeModal === 'charity' && (
                  <div className="space-y-4">
                    <div className="text-center py-2 space-y-1">
                      <Heart className="mx-auto text-pink-500 animate-pulse" size={32} />
                      <h3 className="font-black text-purple-950 text-base">লাইফ গুড ইউজার ফান্ড সংগঠন</h3>
                      <p className="text-xs text-purple-600">মানবসেবায় আমাদের সংগৃহীত ফান্ডের বিবরণ ও আপনার স্বেচ্ছাসেবী কার্যক্রম</p>
                    </div>

                    {donationSuccess ? (
                      <div className="text-center py-4 bg-emerald-50 border border-emerald-150 rounded-2xl space-y-2 p-3 select-none">
                        <CheckCircle2 className="mx-auto text-emerald-600" size={32} />
                        <h4 className="font-bold text-emerald-800 text-sm">সফলভাবে অনুদান জমা হয়েছে!</h4>
                        <p className="text-xs text-purple-800">
                          আপনার সাহায্য দরিদ্র পরিবার ও আর্থিক সহায়তাহীন মানুষের কল্যাণে বড় প্রজেক্ট ফান্ডগুলোতে বণ্টন করা হবে।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 select-none">
                        <p className="text-xs text-gray-600 leading-normal text-center">
                          প্রতিটি ইউজার ভেরিফিকেশনের অর্থের একটি অংশ সংগঠনের ফান্ডে জমা হয়। আপনিও চাইলে সচ্ছল অ্যাকাউন্ট থেকে ডিরেক্ট ওয়ালেট ট্রান্সফারের মাধ্যমে অনুদান প্রদান করতে পারেন।
                        </p>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-purple-950 block">অনুদানের পরিমাণ নির্বাচন করুন</label>
                          <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                            {([20, 50, 100, 200] as const).map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setDonationAmount(amt)}
                                className={`py-2 rounded-xl text-center border transition-colors ${
                                  donationAmount === amt
                                    ? 'bg-purple-700 border-purple-700 text-white'
                                    : 'bg-purple-50 border-purple-100 text-purple-950 hover:bg-purple-100'
                                }`}
                              >
                                {amt} ৳
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleCharityDonation}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer"
                        >
                          নিশ্চিত অনুদান দান করুন
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
