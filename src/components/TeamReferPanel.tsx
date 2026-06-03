/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Copy, Sparkles, TrendingUp, ThumbsUp, Medal, Share2, PlusCircle, Award } from 'lucide-react';
import { mockSocialProofs } from '../data';

interface TeamReferPanelProps {
  walletBalance: number;
  onAddReferral: (earnedCommission: number, memberName: string, level: number) => void;
}

export default function TeamReferPanel({ walletBalance, onAddReferral }: TeamReferPanelProps) {
  const [copied, setCopied] = useState(false);
  const [testMemberName, setTestMemberName] = useState('');
  const [testLevel, setTestLevel] = useState<number>(1);
  const [testAddedList, setTestAddedList] = useState<{ name: string; level: number; commission: number; date: string }[]>([]);

  const referralLink = "https://lifegood.business/register?ref=e5486e7b";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCommissionForLevel = (lvl: number) => {
    switch (lvl) {
      case 1: return 60;
      case 2: return 30;
      case 3: return 15;
      case 4: return 10;
      case 5: return 8;
      case 6: return 5;
      case 7: return 5;
      case 8: return 3;
      case 9: return 2;
      case 10: return 2;
      default: return 1;
    }
  };

  const handleAddTestMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMemberName) return;

    const commission = getCommissionForLevel(testLevel);
    
    // Call global callback to update parent state balances
    onAddReferral(commission, testMemberName, testLevel);

    setTestAddedList([
      {
        name: testMemberName,
        level: testLevel,
        commission,
        date: new Date().toLocaleTimeString()
      },
      ...testAddedList
    ]);

    setTestMemberName('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6" id="team-refer-panel">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">১০-লেভেল রেফারেল ও টিম ডিস্ট্রিবিউশন</h1>
            <p className="text-sm opacity-95">
              লিংক শেয়ারের মাধ্যমে নিজে টিম গঠন করুন। আপনার টিমের সদস্যরা কাজ করলে ১০ম স্তর পর্যন্ত প্রতি রেফারে কোম্পানির ডিস্ট্রিবিউশন প্ল্যান অনুযায়ী আনলিমিটেড প্যাসিভ ইনকাম লাভ করুন!
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl min-w-36 text-center border border-white/22 shrink-0">
            <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-widest block">লেভেল কমিশন</span>
            <p className="text-xl sm:text-2xl font-black mt-1">সর্বোচ্চ ১০ম স্তর</p>
          </div>
        </div>
      </div>

      {/* Refer sharing card block */}
      <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 sm:p-6 shadow-xl shadow-purple-50 space-y-4">
        <h3 className="font-extrabold text-purple-950 text-base sm:text-lg flex items-center gap-2 select-none">
          <Share2 size={18} /> আপনার রেফারেল লিংক শেয়ার করুন
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-purple-50/50 border border-purple-100 rounded-2xl py-3 px-4 font-mono text-purple-950 text-xs sm:text-sm flex items-center justify-between overflow-x-auto no-scrollbar">
            <span>{referralLink}</span>
          </div>

          <button
            onClick={copyToClipboard}
            className={`px-5 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white shadow-md shadow-pink-100'
            }`}
            id="copy-refer-btn"
          >
            <Copy size={16} />
            {copied ? 'কপি হয়েছে' : 'লিংক কপি করুন'}
          </button>
        </div>
      </div>

      {/* Distribution Level Commission & Test Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left column: Multilevel commission details */}
        <div className="md:col-span-6 bg-white/95 rounded-3xl border border-purple-100/85 p-5 shadow-xl shadow-purple-50 space-y-4">
          <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 select-none">
            <Award size={18} /> রেফারেল কমিশন বণ্টন প্ল্যান
          </h3>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 no-scrollbar text-xs sm:text-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
              <div
                key={lvl}
                className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/30 border border-purple-100/40 hover:bg-purple-50 transition-colors"
              >
                <span className="font-bold text-purple-950">লেভেল {lvl} (Level {lvl})</span>
                <span className="font-extrabold text-pink-600 font-mono">+{getCommissionForLevel(lvl)} ৳ কমিশন</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Test simulator to add referrals */}
        <div className="md:col-span-6 bg-white/95 rounded-3xl border border-purple-100/85 p-5 shadow-xl shadow-purple-50 space-y-4">
          <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 select-none">
            <PlusCircle size={18} /> রেফার ডেমো সিমুলেটর
          </h3>
          <p className="text-xs text-purple-600 leading-normal bg-pink-50/50 p-2.5 rounded-xl border border-pink-100 mb-2">
            💡 টেস্ট ডেমো মেম্বার যুক্ত করে চেক করুন কিভাবে আপনার ওয়ালেট ব্যালেন্স ডিরেক্টলি আপগ্রেড হয়!
          </p>

          <form onSubmit={handleAddTestMember} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-purple-950 block mb-1">মেম্বার বা গ্রাহকের নাম</label>
              <input
                type="text"
                required
                value={testMemberName}
                onChange={(e) => setTestMemberName(e.target.value)}
                placeholder="উদাঃ রিয়াজ উদ্দিন"
                className="w-full text-xs bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-purple-950 block mb-1.5">কোন লেভেলে যুক্ত করবেন?</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTestLevel(lvl)}
                    className={`py-1.5 rounded-lg text-xs font-bold text-center border transition-colors ${
                      testLevel === lvl
                        ? 'bg-purple-700 border-purple-700 text-white font-black'
                        : 'bg-purple-50 border-purple-100 text-purple-950 hover:bg-purple-100'
                    }`}
                  >
                    Lvl {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-shadow"
            >
              সিমুলেটেড মেম্বার যুক্ত করুন
            </button>
          </form>

          {/* List of Simulated Test Added members */}
          {testAddedList.length > 0 && (
            <div className="pt-2 border-t border-purple-50 space-y-2">
              <h4 className="text-[10px] font-bold text-purple-900 uppercase">যুক্তকৃত ডেমো কমিশনস ({testAddedList.length})</h4>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 no-scrollbar">
                {testAddedList.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 text-xs">
                    <div>
                      <span className="font-bold text-emerald-950">{m.name}</span>
                      <span className="text-[9px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded ml-1.5 font-bold">Lvl {m.level}</span>
                    </div>
                    <span className="font-black text-emerald-700 font-mono">+{m.commission} ৳</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Social Earnings Proof gallery (as shown in the live FB group screen of the video!) */}
      <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 sm:p-6 shadow-xl shadow-purple-50 space-y-4" id="social-proof-gallery">
        <div className="flex justify-between items-center border-b border-purple-50 pb-3">
          <h3 className="font-extrabold text-purple-950 text-base sm:text-lg flex items-center gap-1.5 select-none">
            <Users size={18} /> সফল মেম্বারদের সাফল্যের রিয়েল প্রমাণপত্র 
          </h3>
          <span className="text-[10px] font-bold px-2.5 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full flex items-center gap-1">
            <Sparkles size={10} className="animate-spin" style={{ animationDuration: '4s' }} /> Life Good Group
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockSocialProofs.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-gradient-to-tr from-white to-purple-50/20 border border-purple-100 flex flex-col justify-between hover:shadow-md transition-shadow gap-3 select-none"
            >
              <div className="flex gap-3">
                <img
                  src={p.avatar}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-purple-200"
                />
                <div>
                  <h4 className="font-semibold text-purple-950 text-sm leading-tight">{p.name}</h4>
                  <p className="text-[9px] text-purple-700 mt-1 font-mono">{p.date}</p>
                </div>
              </div>

              <p className="text-xs text-purple-900 leading-normal italic font-medium">
                "{p.text}"
              </p>

              <div className="flex justify-between items-center border-t border-purple-50/50 pt-2.5 text-xs">
                <span className="text-pink-600 font-bold flex items-center gap-1">
                  <TrendingUp size={12} /> অর্জিত ইনকাম
                </span>
                <span className="px-2.5 py-1 bg-pink-100 text-pink-700 font-black rounded-lg">{p.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
