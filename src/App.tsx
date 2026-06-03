import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, ShoppingBag, Wallet, Users, BookOpen, Briefcase, User, Sparkles, Bell, Clock, LogOut, ShieldCheck, ArrowLeft
} from 'lucide-react';

import { Product, Job, TrainingSection, DriveOffer, EarningsState, Transaction } from './types';
import { mockProducts, mockJobs, mockDriveOffers, mockTrainingSections } from './data';

import HomePanel from './components/HomePanel';
import ResellerShop from './components/ResellerShop';
import WalletPanel from './components/WalletPanel';
import TeamReferPanel from './components/TeamReferPanel';
import WelcomeOfferCourses from './components/WelcomeOfferCourses';
import MicroJobs from './components/MicroJobs';
import AuthPortal from './components/AuthPortal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // 1. Authenticated User State (Neon PostgreSQL DB integration)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [walletBalance, setWalletBalance] = useState<number>(250.00);
  const [todayEarnings, setTodayEarnings] = useState<number>(0.00);
  const [yesterdayEarnings, setYesterdayEarnings] = useState<number>(0.00);
  const [last7DaysEarnings, setLast7DaysEarnings] = useState<number>(0.00);
  const [totalEarnings, setTotalEarnings] = useState<number>(250.00);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('mockJobsState');
    return saved ? JSON.parse(saved) : mockJobs;
  });

  const [trainingSections, setTrainingSections] = useState<TrainingSection[]>(() => {
    const saved = localStorage.getItem('trainingSectionsState');
    return saved ? JSON.parse(saved) : mockTrainingSections;
  });

  // Clock tick — safe formatter (avoids bn-BD locale crash in some browsers)
  useEffect(() => {
    const tick = () => {
      try {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setCurrentTime(`${hours}:${minutes}:${seconds} ${ampm}`);
      } catch {
        setCurrentTime('');
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync user profile & stats from full-stack backend
  const fetchUserProfileSync = async (email: string) => {
    try {
      const response = await fetch(`/api/user-profile?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        
        // Update states based on database records
        if (data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setWalletBalance(Number(data.user.wallet_balance));
          setTodayEarnings(Number(data.user.today_earnings));
          setTotalEarnings(Number(data.user.total_earnings));
        }
        if (data.transactions) {
          setTransactions(data.transactions);
        }
        if (data.completedJobIds && data.completedJobIds.length > 0) {
          // Sync list with local completed states
          const syncedJobs = jobs.map(job => ({
            ...job,
            isCompleted: data.completedJobIds.includes(job.id) || job.isCompleted
          }));
          setJobs(syncedJobs);
          localStorage.setItem('mockJobsState', JSON.stringify(syncedJobs));
        }
      }
    } catch (err) {
      console.error('Failed to sync profile status: ', err);
    }
  };

  // Sync on mount or when currentUser changes
  useEffect(() => {
    if (currentUser?.email) {
      fetchUserProfileSync(currentUser.email);
    }
  }, [currentUser?.email]);

  // Save states to localStorage for persistence
  useEffect(() => {
    localStorage.setItem('mockJobsState', JSON.stringify(jobs));
    localStorage.setItem('trainingSectionsState', JSON.stringify(trainingSections));
  }, [jobs, trainingSections]);

  // Auth Success helper
  const handleAuthSuccess = (userData: any) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setWalletBalance(Number(userData.wallet_balance));
    setTodayEarnings(Number(userData.today_earnings));
    setTotalEarnings(Number(userData.total_earnings));
    fetchUserProfileSync(userData.email);
  };

  // Log out helper
  const handleLogOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowProfileModal(false);
    setActiveTab('home');
  };

  // Sync custom local state updates cleanly
  const syncUserLocalData = (data: any) => {
    if (data.wallet_balance !== undefined) {
      setWalletBalance(Number(data.wallet_balance));
      setTodayEarnings(Number(data.today_earnings));
      setTotalEarnings(Number(data.total_earnings));
      
      const updated = {
        ...currentUser,
        wallet_balance: Number(data.wallet_balance),
        today_earnings: Number(data.today_earnings),
        total_earnings: Number(data.total_earnings)
      };
      setCurrentUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
    if (currentUser?.email) {
      fetchUserProfileSync(currentUser.email);
    }
  };

  // Tab change wrapper
  const handleUpdateTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Callback 1: Adding general reward when completing micro-job task
  const handleJobSuccess = (reward: number, jobTitle: string) => {
    if (!currentUser) return;
    const newBalance = walletBalance + reward;
    const newToday = todayEarnings + reward;
    const newTotal = totalEarnings + reward;

    setWalletBalance(newBalance);
    setTodayEarnings(newToday);
    setTotalEarnings(newTotal);

    const updatedUser = {
      ...currentUser,
      wallet_balance: newBalance,
      today_earnings: newToday,
      total_earnings: newTotal
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'earning',
      amount: reward,
      title: `মাইক্রো জব ভেরিফায়েড: ${jobTitle}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'success'
    };
    setTransactions((prev) => [newTx, ...prev]);
    
    // Refresh database profile list
    if (currentUser?.email) {
      fetchUserProfileSync(currentUser.email);
    }
  };

  // Callback 2: Reseller order mock placing profit trigger
  const handleResellerOrderProfit = async (earnedProfit: number, productName: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          jobId: `resell_${Date.now()}`,
          reward: earnedProfit,
          title: `রিসেলার ডেলিভারি মার্জিন: ${productName}`
        })
      });
      const data = await response.json();
      if (response.ok) {
        syncUserLocalData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Callback 3: Referral code simulations commission reward
  const handleAddReferralCommission = async (commission: number, memberName: string, level: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          jobId: `refer_${Date.now()}`,
          reward: commission,
          title: `রেফার কমিশন লেভেল ${level}: ${memberName}`
        })
      });
      const data = await response.json();
      if (response.ok) {
        syncUserLocalData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Callback 4: Claim reward from Training Sections
  const handleClaimTrainingSectionReward = async (sectionId: string, amount: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          jobId: `course_${sectionId}`,
          reward: amount,
          title: `ট্রেনিং সেকশন বোনাস ক্লেইমড্!`
        })
      });
      const data = await response.json();
      if (response.ok) {
        syncUserLocalData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Callback 5: Withdraw Request Submit (connected to Postgres backend)
  const handleWithdrawRequestSubmitted = async (withdrawAmt: number, gatewayMethod: string, recipientNum: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/submit-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          amount: withdrawAmt,
          method: gatewayMethod,
          recipient: recipientNum
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'উইথড্রয়াল প্রসেস করা যায়নি।');
      }

      setWalletBalance(Number(data.wallet_balance));
      const updatedUser = {
        ...currentUser,
        wallet_balance: Number(data.wallet_balance)
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      fetchUserProfileSync(currentUser.email);
      alert(data.message || 'রিকুয়েস্ট সফলভাবে পেন্ডিং করা হয়েছে!');
    } catch (err: any) {
      alert(err.message || 'ক্যাশআউট ব্যর্থ হয়েছে। পর্যাপ্ত ব্যালেন্স আছে কি না চেক করুন।');
    }
  };

  // Callback 8: Deposit Request Submit (connected to Postgres backend)
  const handleDepositSubmitted = async (depositAmt: number, gatewayMethod: string, senderNum: string, trxId: string) => {
    if (!currentUser) return false;
    try {
      const response = await fetch('/api/submit-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          amount: depositAmt,
          method: gatewayMethod,
          sender: senderNum,
          transactionId: trxId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ডিপোজিট প্রসেস করা যায়নি।');
      }

      setWalletBalance(Number(data.wallet_balance));
      const updatedUser = {
        ...currentUser,
        wallet_balance: Number(data.wallet_balance)
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      fetchUserProfileSync(currentUser.email);
      alert(data.message || 'ডিপোজিট সফলভাবে সম্পন্ন হয়েছে!');
      return true;
    } catch (err: any) {
      alert(err.message || 'ডিপোজিট ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।');
      return false;
    }
  };

  // Callback 6: Donation welfare program
  const handleCharityDonationSubmitted = async (donationAmt: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/submit-charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          amount: donationAmt
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'অনুদানে সমস্যা হয়েছে।');
      }

      setWalletBalance(Number(data.wallet_balance));
      const updatedUser = {
        ...currentUser,
        wallet_balance: Number(data.wallet_balance)
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      fetchUserProfileSync(currentUser.email);
      alert(data.message || 'মহৎ অনুদানের জন্য আন্তরিক ধন্যবাদ!');
    } catch (err: any) {
      alert(err.message || 'ব্যর্থ হয়েছে।');
    }
  };

  // Callback 7: General custom charge (e.g. Job posting or purchasing drive packs)
  const handleRegisterCommission = async (amount: number, description: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          jobId: `charge_${Date.now()}`,
          reward: amount,
          title: description
        })
      });
      const data = await response.json();
      if (response.ok) {
        syncUserLocalData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If user is not logged in, force registration and login first
  if (!currentUser) {
    return <AuthPortal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-50 via-purple-50 to-white text-gray-900 pb-24 lg:pb-6 relative font-sans">
      
      {/* Top Professional App Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 py-3 shadow-sm select-none">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            {/* Back Button (Only on non-home pages) */}
            {activeTab !== 'home' && (
              <button
                onClick={() => handleUpdateTab('home')}
                className="p-1.5 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-200 transition-colors cursor-pointer border border-purple-100"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            
            {/* Logo */}
            <div
              onClick={() => handleUpdateTab('home')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-700 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-pink-200">
                LG
              </div>
              <div>
                <span className="font-black text-sm tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
                  LIFE GOOD
                </span>
                <p className="text-[9px] text-purple-600 font-extrabold tracking-widest uppercase leading-none">
                  Business
                </p>
              </div>
            </div>
          </div>

          {/* Time & Quick balance trackers */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Live Bangladesh clock with custom styling (No black) */}
            <div className="hidden sm:flex items-center gap-1 bg-purple-50/70 border border-purple-100 rounded-xl px-2.5 py-1 text-purple-700 font-semibold text-xs font-mono shadow-inner">
              <Clock size={12} className="text-purple-600" />
              <span>{currentTime}</span>
            </div>

            {/* Wallet Quick viewer */}
            <div
              onClick={() => handleUpdateTab('wallet')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-100 to-purple-100 hover:opacity-90 border border-pink-200 px-3.5 py-1.5 rounded-full cursor-pointer transition-all shadow-sm"
            >
              <Wallet size={14} className="text-pink-600" />
              <span className="text-purple-950 font-black text-xs sm:text-sm font-mono leading-none">
                {walletBalance.toFixed(2)} ৳
              </span>
            </div>

            {/* Profile Avatar trigger */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 text-purple-800 flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer"
            >
              <User size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* Main interactive tabs content dispatcher */}
      <main className="px-4 py-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <HomePanel
                walletBalance={walletBalance}
                onUpdateTab={handleUpdateTab}
                onRegisterCommission={handleRegisterCommission}
                onDonationSubmitted={handleCharityDonationSubmitted}
                driveOffers={mockDriveOffers}
              />
            )}
            {activeTab === 'shop' && (
              <ResellerShop
                products={mockProducts}
                onOrderCompleted={handleResellerOrderProfit}
              />
            )}
            {activeTab === 'wallet' && (
              <WalletPanel
                earnings={{
                  currentBalance: walletBalance,
                  todayEarnings,
                  yesterdayEarnings,
                  last7DaysEarnings,
                  totalEarnings,
                  transactions
                }}
                onWithdrawSubmitted={handleWithdrawRequestSubmitted}
                onDepositSubmitted={handleDepositSubmitted}
              />
            )}
            {activeTab === 'team' && (
              <TeamReferPanel
                walletBalance={walletBalance}
                onAddReferral={handleAddReferralCommission}
              />
            )}
            {activeTab === 'welcome' && (
              <WelcomeOfferCourses
                sections={trainingSections}
                onClaimReward={handleClaimTrainingSectionReward}
                onUpdateSections={setTrainingSections}
                walletBalance={walletBalance}
              />
            )}
            {activeTab === 'jobs' && (
              <MicroJobs
                jobs={jobs}
                onJobSuccess={handleJobSuccess}
                onUpdateJobs={setJobs}
                userEmail={currentUser.email}
              />
            )}
            {activeTab === 'admin' && currentUser?.email === 'asiful@gmail.com' && (
              <AdminPanel adminEmail={currentUser.email} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Tab Navigation for Mobile / Tablet Viewports */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-purple-100 py-2.5 px-3 z-40 shadow-xl flex justify-around items-center select-none" id="bottom-navigation">
        <button
          onClick={() => handleUpdateTab('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home' ? 'text-purple-700 scale-105 font-extrabold' : 'text-purple-400 hover:text-purple-600'
          }`}
          id="nav-tab-home"
        >
          <Home size={18} />
          <span className="text-[10px]">হোম</span>
        </button>

        <button
          onClick={() => handleUpdateTab('shop')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'shop' ? 'text-purple-700 scale-105 font-extrabold' : 'text-purple-400 hover:text-purple-600'
          }`}
          id="nav-tab-shop"
        >
          <ShoppingBag size={18} />
          <span className="text-[10px]">রিসেল শপ</span>
        </button>

        <button
          onClick={() => handleUpdateTab('wallet')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'wallet' ? 'text-purple-700 scale-105 font-extrabold' : 'text-purple-400 hover:text-purple-600'
          }`}
          id="nav-tab-wallet"
        >
          <Wallet size={18} />
          <span className="text-[10px]">ওয়ালেট</span>
        </button>

        <button
          onClick={() => handleUpdateTab('team')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'team' ? 'text-purple-700 scale-105 font-extrabold' : 'text-purple-400 hover:text-purple-600'
          }`}
          id="nav-tab-team"
        >
          <Users size={18} />
          <span className="text-[10px]">টিম রেফার</span>
        </button>

        <button
          onClick={() => handleUpdateTab('welcome')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'welcome' ? 'text-purple-700 scale-105 font-extrabold' : 'text-purple-400 hover:text-purple-600'
          }`}
          id="nav-tab-welcome"
        >
          <BookOpen size={18} />
          <span className="text-[10px]">ট্রেনিং কোর্স</span>
        </button>

        <button
          onClick={() => handleUpdateTab('jobs')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'jobs' ? 'text-purple-700 scale-105 font-extrabold' : 'text-purple-400 hover:text-purple-600'
          }`}
          id="nav-tab-jobs"
        >
          <Briefcase size={18} />
          <span className="text-[10px]">মাইক্রো কাজ</span>
        </button>

        {currentUser?.email === 'asiful@gmail.com' && (
          <button
            onClick={() => handleUpdateTab('admin')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'admin' ? 'text-pink-600 scale-105 font-extrabold' : 'text-purple-400 hover:text-pink-500'
            }`}
          >
            <ShieldCheck size={18} />
            <span className="text-[10px]">এডমিন</span>
          </button>
        )}
      </nav>

      {/* User Profile Modal Dialog Card */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 bg-purple-950/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full border border-purple-100"
              id="profile-panel-modal"
            >
              <div className="p-5 bg-gradient-to-r from-purple-700 to-pink-500 text-white flex flex-col items-center text-center relative overflow-hidden select-none">
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center mb-2 z-10 text-white font-bold text-xl">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'LG'}
                </div>
                <h3 className="font-extrabold text-white text-base z-10 select-all font-sans">
                  {currentUser.name}
                </h3>
                <p className="text-xs text-pink-100 z-10 tracking-wide select-all font-mono">
                  {currentUser.email}
                </p>
                <span className="mt-2.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-inner z-10">
                  <ShieldCheck size={12} className="text-yellow-300 animate-pulse" /> ভেরিফাইড ব্র্যান্ড মেম্বার
                </span>
              </div>

              <div className="p-5 space-y-4 text-xs sm:text-sm">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center py-2 border-b border-purple-50">
                    <span className="text-gray-500 font-medium">র্যাঙ্ক স্ট্যাটাস:</span>
                    <span className="font-bold text-purple-950 flex items-center gap-1">
                      <Sparkles size={14} className="text-pink-500 animate-spin" style={{ animationDuration: '6s' }} />
                      {currentUser.rank_status || 'Bronze Manager Lvl 1'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-purple-50">
                    <span className="text-gray-500 font-medium">নিবন্ধিত মোবাইল:</span>
                    <span className="font-mono text-purple-950 font-bold">{currentUser.phone}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 font-medium">অ্যাকাউন্টের ধরন:</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-150 rounded text-[10px] font-extrabold uppercase">
                      Premium Partner
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleLogOut}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-center cursor-pointer border border-red-100 text-xs flex items-center justify-center gap-1"
                  >
                    <LogOut size={14} /> লগআউট করুন
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-center cursor-pointer border border-purple-100/60 text-xs"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
