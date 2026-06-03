import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Sparkles, ShieldCheck, DollarSign, Users, Award, Eye, Play, ArrowRight, BookOpen, AlertCircle,
    TrendingUp, CheckCircle2, Laptop, Network, Search, RefreshCw, Check, X, CreditCard,
    ArrowDownLeft, ArrowUpRight, UserCheck, Trash2
} from 'lucide-react';

interface AdminMonetizationPanelProps {
    walletBalance: number;
    onUpdateTab: (tab: string) => void;
    onUpgradeToVIP: (cost: number) => Promise<boolean>;
    isUserVIP: boolean;
}

interface DbUser {
    name: string;
    phone: string;
    email: string;
    wallet_balance: number;
    today_earnings: number;
    total_earnings: number;
    rank_status: string;
}

interface DbTx {
    id: string;
    user_email: string;
    type: string;
    amount: number;
    title: string;
    date: string;
    status: 'success' | 'pending' | 'failed';
    payment_method?: string;
    recipient?: string;
}

export default function AdminMonetizationPanel({
    walletBalance,
    onUpdateTab,
    onUpgradeToVIP,
    isUserVIP
}: AdminMonetizationPanelProps) {
    // Navigation inside this panel
    const [subTab, setSubTab] = useState<'admin' | 'guide'>('admin');

    // Database State Variables
    const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
    const [dbTransactions, setDbTransactions] = useState<DbTx[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [successText, setSuccessText] = useState('');

    // Active filter for Admin Dashboard
    const [adminFilter, setAdminFilter] = useState<'deposits' | 'withdrawals' | 'users' | 'all-tx'>('deposits');
    const [userQuery, setUserQuery] = useState('');

    // Simulator input states for projection calculator
    const [activeUsersCount, setActiveUsersCount] = useState<number>(350);
    const [vipFee, setVipFee] = useState<number>(100);
    const [dailyAdTasksPerUser, setDailyAdTasksPerUser] = useState<number>(8);
    const [resellCommissionPerSale, setResellCommissionPerSale] = useState<number>(50);

    // Ad simulation states
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adWatchSeconds, setAdWatchSeconds] = useState(0);
    const [adComplete, setAdComplete] = useState(false);
    const [simulationPlatformRevenue, setSimulationPlatformRevenue] = useState(12840.00);

    // Upgrade states
    const [upgradeError, setUpgradeError] = useState('');
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);

    // Load live DB stats on mount & tab switched
    const fetchLiveDatabaseStats = async () => {
        setIsLoading(true);
        setErrorText('');
        try {
            const response = await fetch('/api/admin/system-stats');
            if (!response.ok) {
                throw new Error('ডেটাবেজ থেকে লাইভ তথ্য লোড করতে ব্যর্থ হয়েছে।');
            }
            const data = await response.json();
            setDbUsers(data.users || []);
            setDbTransactions(data.transactions || []);
        } catch (err: any) {
            console.error(err);
            setErrorText(err.message || 'নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveDatabaseStats();
    }, []);

    // Handle Admin Approvals
    const handleApproveTransaction = async (txId: string) => {
        setIsLoading(true);
        setErrorText('');
        setSuccessText('');
        try {
            const response = await fetch('/api/admin/approve-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: txId })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'অনুমোদন প্রক্রিয়া সম্পন্ন করা যায়নি।');
            }
            setSuccessText('✅ ট্রানজেকশন সফলভাবে অনুমোদন করা হয়েছে এবং ইউজারের ব্যালেন্স আপডেট হয়েছে!');
            fetchLiveDatabaseStats();
        } catch (err: any) {
            setErrorText(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Admin Rejections
    const handleRejectTransaction = async (txId: string) => {
        setIsLoading(true);
        setErrorText('');
        setSuccessText('');
        try {
            const response = await fetch('/api/admin/reject-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: txId })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'বাতিল প্রক্রিয়া সম্পন্ন করা যায়নি।');
            }
            setSuccessText('❌ ট্রানজেকশনটি বাতিল করা হয়েছে এবং উইথড্র ফান্ড থাকলে ইউজার ব্যালেন্সে রিফান্ড হয়েছে!');
            fetchLiveDatabaseStats();
        } catch (err: any) {
            setErrorText(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Start watching sponsor ad
    const startWatchingAd = () => {
        setIsWatchingAd(true);
        setAdWatchSeconds(7);
        setAdComplete(false);

        const interval = setInterval(() => {
            setAdWatchSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsWatchingAd(false);
                    setAdComplete(true);
                    // Reward user 0.20 ৳ and add platform profit of 1.50 ৳
                    onUpgradeToVIP(-0.20);
                    setSimulationPlatformRevenue((old) => old + 1.50);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleUpgradeVIPAction = async () => {
        if (walletBalance < 100) {
            setUpgradeError('⚠️ আপনার ব্যাংক/ওয়ালেট ব্যালেন্স পর্যাপ্ত নয়! কমপক্ষে ১০০ ৳ থাকতে হবে। বিকাশে ডিপোজিট করে ব্যালেন্স বাড়ান।');
            return;
        }
        setUpgradeError('');
        const success = await onUpgradeToVIP(100);
        if (success) {
            setUpgradeSuccess(true);
        }
    };

    // Math calculators
    const monthlyActivationRevenue = Math.round(activeUsersCount * 0.15 * vipFee);
    const monthlyAdRevenue = Math.round(activeUsersCount * dailyAdTasksPerUser * 1.50 * 30);
    const monthlyResellRevenue = Math.round(activeUsersCount * 2 * resellCommissionPerSale);
    const totalMonthlyOwnerProfit = monthlyActivationRevenue + monthlyAdRevenue + monthlyResellRevenue;

    // Filter computations
    const pendingDeposits = dbTransactions.filter(t => t.type === 'deposit' && t.status === 'pending');
    const pendingWithdrawals = dbTransactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

    const filteredUsers = dbUsers.filter(u =>
        u.name?.toLowerCase().includes(userQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(userQuery.toLowerCase()) ||
        u.phone?.includes(userQuery)
    );

    return (
        <div className="space-y-6" id="owner-monetization-suite">

            {/* Dynamic Segment Selection tab */}
            <div className="flex bg-purple-100/60 p-1.5 rounded-2xl gap-1">
                <button
                    onClick={() => setSubTab('admin')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${subTab === 'admin'
                            ? 'bg-purple-750 text-white shadow-md'
                            : 'text-purple-900 hover:bg-purple-200/50'
                        }`}
                >
                    <ShieldCheck size={16} /> ⚡ লাইভ এডমিন ড্যাশবোর্ড (Live DB Controls)
                </button>
                <button
                    onClick={() => setSubTab('guide')}
                    className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${subTab === 'guide'
                            ? 'bg-purple-750 text-white shadow-md'
                            : 'text-purple-900 hover:bg-purple-200/50'
                        }`}
                >
                    <BookOpen size={16} /> 📖 ওনারশিপ গাইড ও ক্যালকুলেটর
                </button>
            </div>

            {subTab === 'admin' ? (
                /* live database admin panel dashboard */
                <div className="space-y-6">

                    {/* Admin Stats Header summary statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/95 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block uppercase font-bold">মোট নিবন্ধিত ইউজার</span>
                                <span className="text-lg font-black text-purple-950 font-mono">{dbUsers.length} জন</span>
                            </div>
                        </div>

                        <div className="p-4 bg-white/95 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block uppercase font-bold">সর্বমোট ওয়ালেট ব্যালেন্স</span>
                                <span className="text-lg font-black text-emerald-600 font-mono">
                                    {dbUsers.reduce((sum, u) => sum + Number(u.wallet_balance), 0).toFixed(2)} ৳
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-white/95 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3 relative cursor-pointer" onClick={() => setAdminFilter('deposits')}>
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <ArrowDownLeft size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block uppercase font-bold">পেন্ডিং ডিপোজিট</span>
                                <span className={`text-lg font-black font-mono ${pendingDeposits.length > 0 ? 'text-rose-600 animate-pulse' : 'text-purple-950'}`}>
                                    {pendingDeposits.length} টি
                                </span>
                            </div>
                            {pendingDeposits.length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping"></span>
                            )}
                        </div>

                        <div className="p-4 bg-white/95 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3 relative cursor-pointer" onClick={() => setAdminFilter('withdrawals')}>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <ArrowUpRight size={20} />
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-500 block uppercase font-bold">পেন্ডিং ক্যাশআউট</span>
                                <span className="text-lg font-black text-purple-950 font-mono">{pendingWithdrawals.length} টি</span>
                            </div>
                            {pendingWithdrawals.length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></span>
                            )}
                        </div>
                    </div>

                    {/* User Messages and Notifications */}
                    <AnimatePresence mode="wait">
                        {errorText && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                                <AlertCircle size={16} className="shrink-0" /> {errorText}
                            </motion.div>
                        )}
                        {successText && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                                <CheckCircle2 size={16} className="shrink-0 animate-bounce" /> {successText}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sub Navigation controls & Search */}
                    <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 shadow-sm space-y-4">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setAdminFilter('deposits')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${adminFilter === 'deposits' ? 'bg-purple-700 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-100/50'
                                        }`}
                                >
                                    📥 ডিপোজিট যাচাই ({pendingDeposits.length})
                                </button>
                                <button
                                    onClick={() => setAdminFilter('withdrawals')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${adminFilter === 'withdrawals' ? 'bg-purple-700 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-100/50'
                                        }`}
                                >
                                    📤 ক্যাশআউট রিকোয়েস্ট ({pendingWithdrawals.length})
                                </button>
                                <button
                                    onClick={() => setAdminFilter('users')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${adminFilter === 'users' ? 'bg-purple-700 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-100/50'
                                        }`}
                                >
                                    👥 ইউজার লিস্ট ({dbUsers.length})
                                </button>
                                <button
                                    onClick={() => setAdminFilter('all-tx')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${adminFilter === 'all-tx' ? 'bg-purple-700 text-white' : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-100/50'
                                        }`}
                                >
                                    📜 ট্রানজেকশন হিস্ট্রি ({dbTransactions.length})
                                </button>
                            </div>

                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={fetchLiveDatabaseStats}
                                    className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-xl text-purple-700 cursor-pointer transition-all shrink-0 flex items-center justify-center"
                                    title="রিফ্রেশ করুন"
                                >
                                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Filter 1: Deposits section */}
                        {adminFilter === 'deposits' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-black text-purple-950 flex items-center gap-1.5 text-amber-800">
                                    ⚠️ পেন্ডিং বিকাশ ও নগদ ডিপোজিট যাচাইকরণ:
                                </h4>
                                {pendingDeposits.length === 0 ? (
                                    <div className="text-center py-10 bg-purple-50/30 rounded-2xl border border-dashed border-purple-100 text-gray-400 text-xs">
                                        কোন পেন্ডিং ডিপোজিট আবেদন পাওয়া যায়নি।
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {pendingDeposits.map((tx) => (
                                            <div key={tx.id} className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl relative flex flex-col justify-between gap-3 text-xs">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                                                            {tx.payment_method}
                                                        </span>
                                                        <span className="text-gray-400 text-[10px] font-mono">{tx.date}</span>
                                                    </div>
                                                    <p className="font-bold text-sm text-purple-950">
                                                        পরিমাণ: <span className="text-pink-600 font-extrabold font-mono text-base">{tx.amount} ৳</span>
                                                    </p>
                                                    <p className="text-gray-600">
                                                        📲 প্রেরক নাম্বার: <span className="font-bold text-gray-800 font-mono">{tx.recipient || 'N/A'}</span>
                                                    </p>
                                                    <p className="text-gray-650 font-mono font-bold break-all bg-white py-1 px-1.5 border border-amber-100 rounded">
                                                        🔑 TrxID: <span className="text-purple-950 text-xs font-black uppercase">{tx.title.split('TrxID: ')[1] || 'N/A'}</span>
                                                    </p>
                                                    <p className="text-gray-500 text-[10px]">
                                                        ইউজার ইমেইল: <span className="font-sans font-semibold text-purple-700">{tx.user_email}</span>
                                                    </p>
                                                </div>

                                                <div className="flex gap-2 pt-2 border-t border-amber-100">
                                                    <button
                                                        onClick={() => handleApproveTransaction(tx.id)}
                                                        disabled={isLoading}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm text-[11px]"
                                                    >
                                                        <Check size={14} /> অনুমোদন
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectTransaction(tx.id)}
                                                        disabled={isLoading}
                                                        className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm text-[11px]"
                                                    >
                                                        <X size={14} /> বাতিল
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Filter 2: withdrawals section */}
                        {adminFilter === 'withdrawals' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-black text-purple-950 flex items-center gap-1.5 text-blue-800">
                                    📢 পেন্ডিং উইথড্র ও ক্যাশআউট লিস্ট:
                                </h4>
                                {pendingWithdrawals.length === 0 ? (
                                    <div className="text-center py-10 bg-purple-50/30 rounded-2xl border border-dashed border-purple-100 text-gray-400 text-xs">
                                        কোন পেন্ডিং ক্যাশআউট রিকোয়েস্ট নেই।
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {pendingWithdrawals.map((tx) => (
                                            <div key={tx.id} className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-2xl relative flex flex-col justify-between gap-3 text-xs">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                                                            {tx.payment_method}
                                                        </span>
                                                        <span className="text-gray-400 text-[10px] font-mono">{tx.date}</span>
                                                    </div>
                                                    <p className="font-bold text-sm text-purple-950">
                                                        উইথড্র পরিমাণ: <span className="text-rose-600 font-extrabold font-mono text-base">{tx.amount} ৳</span>
                                                    </p>
                                                    <p className="text-gray-650">
                                                        📞 ক্যাশআউট প্রাপক নাম্বার: <span className="font-bold text-blue-950 font-mono">{tx.recipient || 'N/A'}</span>
                                                    </p>
                                                    <p className="text-gray-500 text-[10px]">
                                                        আবেদনকারী: <span className="font-sans text-purple-700 font-semibold">{tx.user_email}</span>
                                                    </p>
                                                    <div className="p-2 bg-yellow-100/50 border border-yellow-200/40 rounded text-[10px] text-amber-900">
                                                        👉 <strong>এডমিন গাইড: </strong> আপনার ফোনে {tx.payment_method} অ্যাপ ট্র্যান্সফার খুলে {tx.recipient} নাম্বারে ম্যানুয়ালি টাকা পাঠিয়ে দিয়ে তারপর "পেমেন্ট সফল" বাটনে ক্লিক করুন।
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-2 border-t border-blue-100">
                                                    <button
                                                        onClick={() => handleApproveTransaction(tx.id)}
                                                        disabled={isLoading}
                                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm text-[11px]"
                                                    >
                                                        <Check size={14} /> পেমেন্ট সম্পন্ন
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectTransaction(tx.id)}
                                                        disabled={isLoading}
                                                        className="flex-1 py-12 px-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm text-[11px]"
                                                    >
                                                        <X size={14} /> বাতিল ও রিফান্ড
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Filter 3: Users database section */}
                        {adminFilter === 'users' && (
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-50 pb-2">
                                    <h4 className="text-sm font-black text-purple-950">
                                        ব্যবহারকারী ডাটাবেজ (PostgreSQL Users):
                                    </h4>
                                    <div className="relative max-w-xs w-full sm:w-64">
                                        <input
                                            type="text"
                                            placeholder="নাম, ইমেইল বা ফোন দিয়ে সার্চ"
                                            value={userQuery}
                                            onChange={(e) => setUserQuery(e.target.value)}
                                            className="w-full text-xs bg-purple-50/50 focus:bg-white border border-purple-100 focus:border-purple-300 rounded-xl pl-8 pr-3 py-1.5 text-purple-950 focus:outline-none"
                                        />
                                        <Search className="absolute left-2.5 top-2.5 text-purple-400" size={13} />
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-purple-100">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-purple-50 text-purple-950 font-black">
                                                <th className="p-2.5 border-b border-purple-100">নাম ও ফোন</th>
                                                <th className="p-2.5 border-b border-purple-100">ইমেইল এড্রেস</th>
                                                <th className="p-2.5 border-b border-purple-100">র‍্যাংক স্ট্যাটাস</th>
                                                <th className="p-2.5 border-b border-purple-100 text-right">ব্যালেন্স (৳)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-gray-400">কোন ইউজার পাওয়া যায়নি।</td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((u, i) => (
                                                    <tr key={u.email} className={`hover:bg-purple-50/40 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-purple-50/10'}`}>
                                                        <td className="p-2.5 border-b border-purple-100">
                                                            <div className="font-extrabold text-purple-950">{u.name}</div>
                                                            <div className="text-[10px] text-gray-500 font-mono">{u.phone}</div>
                                                        </td>
                                                        <td className="p-2.5 border-b border-purple-100 font-sans">{u.email}</td>
                                                        <td className="p-2.5 border-b border-purple-100 font-bold text-purple-600">{u.rank_status}</td>
                                                        <td className="p-2.5 border-b border-purple-100 text-right font-black font-mono text-emerald-600">
                                                            {Number(u.wallet_balance).toFixed(2)} ৳
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Filter 4: All history */}
                        {adminFilter === 'all-tx' && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-black text-purple-950">
                                    সর্বশেষ সকল ট্রানজেকশন হিস্ট্রি:
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-purple-100 text-xs">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-purple-50 text-purple-950 font-black">
                                                <th className="p-2.5 border-b border-purple-100">টাইপ ও টাইটেল</th>
                                                <th className="p-2.5 border-b border-purple-100">ইউজার</th>
                                                <th className="p-2.5 border-b border-purple-100">তারিখ ও সময়</th>
                                                <th className="p-2.5 border-b border-purple-100">অ্যামাউন্ট</th>
                                                <th className="p-2.5 border-b border-purple-100 text-right">অবস্থা (Status)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dbTransactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-gray-400">কোন লেনদেন পাওয়া যায়নি।</td>
                                                </tr>
                                            ) : (
                                                dbTransactions.slice(0, 50).map((tx, i) => (
                                                    <tr key={tx.id} className={`hover:bg-purple-50/40 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-purple-50/10'}`}>
                                                        <td className="p-2.5 border-b border-purple-100">
                                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mr-1.5 ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-800' : tx.type === 'withdrawal' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                {tx.type}
                                                            </span>
                                                            <span className="font-bold text-gray-700">{tx.title}</span>
                                                        </td>
                                                        <td className="p-2.5 border-b border-purple-100 text-gray-500 font-mono text-[10px]">{tx.user_email}</td>
                                                        <td className="p-2.5 border-b border-purple-100 text-gray-400 font-mono text-[10px]">{tx.date}</td>
                                                        <td className={`p-2.5 border-b border-purple-100 font-extrabold font-mono ${tx.type === 'deposit' || tx.type === 'earning' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {tx.type === 'deposit' || tx.type === 'earning' ? '+' : '-'}{tx.amount} ৳
                                                        </td>
                                                        <td className="p-2.5 border-b border-purple-100 text-right">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold font-sans uppercase ${tx.status === 'success' ? 'bg-emerald-100 text-emerald-800' : tx.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-rose-100 text-rose-800'
                                                                }`}>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            ) : (
                /* guide values and indicators */
                <div className="space-y-6">

                    {/* Premium VIP Activation Platform */}
                    <div className="bg-gradient-to-r from-purple-800 to-pink-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 relative overflow-hidden select-none">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute left-10 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1 bg-yellow-300 text-purple-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    👑 PREMIUM ACTIVE PARTNER
                                </span>
                                <h2 className="text-xl sm:text-2xl font-black">ভিআইপি এক্টিভেশন পোর্টাল (VIP Upgrade)</h2>
                                <p className="text-xs sm:text-sm text-pink-100 max-w-xl leading-relaxed">
                                    আপনার সাধারণ অ্যাকাউন্টকে ১০০ ৳ ফি দিয়ে <strong>"ভেরিফাইড ভিআইপি অ্যাকাউন্ট"</strong>-এ আপগ্রেড করুন! এতে সব মাইক্রো কাজের লভ্যাংশ দ্বিগুণ হবে এবং আমাদের ওয়েলকাম ট্রেনিং ভিডিও দেখে ইনকাম ক্লেইম করতে পারবেন।
                                </p>
                            </div>

                            <div className="shrink-0">
                                {isUserVIP || upgradeSuccess ? (
                                    <span className="px-5 py-3 bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center gap-1.5 shadow-lg">
                                        <ShieldCheck size={18} className="animate-bounce" /> আপনি একজন ভিআইপি পার্টনার!
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleUpgradeVIPAction}
                                        className="px-6 py-3.5 bg-yellow-300 hover:bg-yellow-400 text-purple-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer"
                                    >
                                        ১০০ ৳ দিয়ে আইডি এক্টিভ করুন
                                    </button>
                                )}
                            </div>
                        </div>

                        {upgradeError && (
                            <div className="mt-4 p-3 bg-red-900/40 border border-red-500/30 rounded-xl text-red-100 text-xs flex items-center gap-1.5 relative z-10">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{upgradeError}</span>
                            </div>
                        )}
                    </div>

                    {/* Owner Monetization core education */}
                    <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 sm:p-6 shadow-xl shadow-purple-50 space-y-4">
                        <div className="border-b border-purple-100/80 pb-3">
                            <h3 className="text-base sm:text-lg font-black text-purple-950 flex items-center gap-1.5">
                                <Laptop size={20} className="text-purple-700 animate-pulse" /> এই ওয়েবসাইট থেকে আপনার টাকা (ইনকাম) কিভাবে আসবে?
                            </h3>
                            <p className="text-xs text-purple-600 mt-1">
                                কোম্পানি ও ওয়েবসাইট ওনার হিসেবে ভিজিটরদের কাজ এবং বিজ্ঞাপন থেকে সরাসরি লাইভ ইনকামের মূল মেকানিজম এখানে দেখুন:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                                    ১
                                </div>
                                <h4 className="font-extrabold text-purple-950 text-sm">আইডি অ্যাক্টিভেশন ক্যাশ-ইন (VIP Activation)</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    ইউজাররা কাজ করার সুবিধার্থে বিকাশ/নগদ এর মাধ্যমে টাকা ডিপোজিট করে এবং ১০০ ৳ দিয়ে তাদের ভিআইপি অ্যাকাউন্ট এক্টিভ করে। এই সম্পূর্ণ টাকা সরাসরি এডমিন হিসেবে ওনারের নগদ বা বিকাশ মোবাইল ওয়ালেটে জমা হয়।
                                </p>
                            </div>

                            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-black">
                                    ২
                                </div>
                                <h4 className="font-extrabold text-purple-950 text-sm">বিজ্ঞাপন ও গুগলের সাথে রেভিনিউ শেয়ার (Ad Revenue)</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    সাইটে বিজ্ঞাপন প্রদর্শন এবং এডসেন্স ব্যবহারের মাধ্যমে প্রতি বিজ্ঞাপন দেখায় ১.৫০ ৳ এডমিন একাউন্টে কোম্পানির লাভ জমা হয়, যার মধ্য হতে মাত্র ০.২০ ৳ ইউজারকে রিওয়ার্ড হিসেবে দেওয়া হয়।
                                </p>
                            </div>

                            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs space-y-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                                    ৩
                                </div>
                                <h4 className="font-extrabold text-purple-950 text-sm">রিসেল শপ ও সার্ভিস মার্জিন (Resale Profits)</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    সদস্যরা প্রতি পাঞ্জাবি বা টি-শার্ট বিক্রি করলে সরবরাহকারী মূল্যের সাথে আমাদের সার্ভিস কমিশন হিসেবে ২০% লাভ সাইটের মূল ব্যাংক একাউন্টে যুক্ত হতে থাকে।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Google Ad simulation */}
                    <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 sm:p-6 shadow-xl shadow-purple-50 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-7 space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                                    LIVE Google AdMob/AdSense Simulation
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-purple-950">
                                    সহজ স্পন্সর বিজ্ঞাপন দেখে ইনকাম করুন (ব্যবহারকারীদের জন্য কাজ)
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    গুগল বা থার্ড পার্টি এড এজেন্সির মাধ্যমে কোম্পানি টাকা সরাসরি তাদের ব্যাংক অ্যাকাউন্টে পায়। নিচে দেওয়া স্পন্সরড বিজ্ঞাপনটি পরীক্ষামূলকভাবে চালু করে ওনার এবং ইউজারের উভয়ের মুনাফার লাইভ প্রমাণ দেখুন।
                                </p>
                            </div>

                            <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 text-xs flex justify-between gap-4">
                                <div>
                                    <span className="text-gray-500">আপনার রিওয়ার্ড (ইউজার লভ্যাংশ):</span>
                                    <p className="font-extrabold text-emerald-600 text-base font-mono">+০.২০ ৳</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500">এডমিনের লাভ (AdSense Revenue):</span>
                                    <p className="font-extrabold text-purple-700 text-base font-mono">+১.৫০ ৳</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {isWatchingAd ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="px-6 py-2.5 bg-purple-400 text-white font-bold text-xs sm:text-sm rounded-xl cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Eye className="animate-spin" size={16} /> বিজ্ঞাপন চলছে ({adWatchSeconds} সেকেন্ড বাকি...)
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={startWatchingAd}
                                        className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Play size={14} fill="currentColor" /> বিজ্ঞাপন দেখুন এবং লাইভ ইনকাম টেস্ট করুন
                                    </button>
                                )}

                                <span className="text-xs text-purple-600 font-bold bg-purple-50 px-3 py-2 border border-purple-100/60 rounded-xl leading-none flex items-center">
                                    বিজ্ঞপ্তি: এডে সফল ক্লিক করলে আপনার ওয়ালেটে ০.২০ ৳ ইনস্ট্যান্ট যুক্ত হবে!
                                </span>
                            </div>

                            {adComplete && (
                                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl">
                                    <CheckCircle2 size={14} /> চমৎকার! বিজ্ঞাপন সফলভাবে সমাপ্ত! আপনার ওয়ালেটে ০.২০ ৳ যোগ হয়েছে এবং এডমিনের মোট লাভ বৃদ্ধি পেয়েছে।
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-5 bg-gradient-to-tr from-purple-950 to-purple-800 p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between h-56 select-none shadow-lg">
                            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                            <div>
                                <div className="flex justify-between items-center bg-white/10 border border-white/20 rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase inline-block">
                                    ⭐ এডমিন লাইভ প্রফিট ভিউয়ার
                                </div>
                                <p className="text-[10px] text-pink-200 mt-2.5 font-bold tracking-widest uppercase">মোট এডসেন্স ও আইডি এক্টিভেশন লভ্যাংশ</p>
                                <p className="text-3xl font-black text-yellow-300 font-mono mt-1">
                                    {simulationPlatformRevenue.toFixed(2)} ৳
                                </p>
                            </div>

                            <div className="border-t border-white/15 pt-3 mt-3 text-xs text-white/80 space-y-1 font-mono">
                                <div className="flex justify-between">
                                    <span>ব্যবহারকারী বিজ্ঞাপনে ক্লিক:</span>
                                    <span className="font-bold text-emerald-400">০.২০ ৳ আউট</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>গুগল নেটওয়ার্ক থেকে প্রফিট:</span>
                                    <span className="font-bold text-yellow-300">১.৫০ ৳ ইন</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Revenue & Growth Projection Calculator */}
                    <div className="bg-white/95 rounded-3xl border border-purple-100/80 p-5 sm:p-6 shadow-xl shadow-purple-50 space-y-4">
                        <div className="border-b border-purple-100 pb-3">
                            <h3 className="text-base sm:text-lg font-black text-purple-950 flex items-center gap-1.5">
                                <TrendingUp size={20} className="text-pink-500" /> সাইট ওনার লাভ প্রজেকশন ক্যালকুলেটর (Revenue Calculator)
                            </h3>
                            <p className="text-xs text-purple-600 mt-1">
                                আপনার ওয়েবসাইটে কতজন সক্রিয় ইউজার থাকলে প্রতি মাসে আপনার পকেট বা ব্যাংক একাউন্টে কত টাকা লাভ আসবে তা হিসাব করে দেখুন:
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-purple-900 block mb-1">সক্রিয় ইউজার সংখ্যা (Monthly Users)</label>
                                <input
                                    type="number"
                                    value={activeUsersCount}
                                    onChange={(e) => setActiveUsersCount(Math.max(1, Number(e.target.value)))}
                                    className="w-full text-xs sm:text-sm bg-white border border-purple-100 rounded-xl py-2 px-3 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-purple-300"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-purple-900 block mb-1">ভিআইপি এক্টিভেশন ফি (Registration ৳)</label>
                                <input
                                    type="number"
                                    value={vipFee}
                                    onChange={(e) => setVipFee(Math.max(1, Number(e.target.value)))}
                                    className="w-full text-xs sm:text-sm bg-white border border-purple-100 rounded-xl py-2 px-3 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-purple-300"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-purple-900 block mb-1">দৈনিক বিজ্ঞাপন কাজ (Ads Per User)</label>
                                <input
                                    type="number"
                                    value={dailyAdTasksPerUser}
                                    onChange={(e) => setDailyAdTasksPerUser(Math.max(0, Number(e.target.value)))}
                                    className="w-full text-xs sm:text-sm bg-white border border-purple-100 rounded-xl py-2 px-3 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-purple-300"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-purple-900 block mb-1">রিসেল মার্জিন মুনাফা (Profit Per Sale)</label>
                                <input
                                    type="number"
                                    value={resellCommissionPerSale}
                                    onChange={(e) => setResellCommissionPerSale(Math.max(0, Number(e.target.value)))}
                                    className="w-full text-xs sm:text-sm bg-white border border-purple-100 rounded-xl py-2 px-3 text-purple-950 font-bold focus:outline-none focus:ring-1 focus:ring-purple-300"
                                />
                            </div>
                        </div>

                        {/* Dynamic calculation result card */}
                        <div className="bg-gradient-to-r from-purple-900 via-pink-750 to-pink-600 rounded-3xl p-5 sm:p-6 text-white grid grid-cols-1 md:grid-cols-4 gap-6 select-none mt-2 shadow-lg">
                            <div className="space-y-1">
                                <span className="text-[10px] text-pink-200 block uppercase font-bold tracking-widest">আইডি এক্টিভেশন থেকে লাভ</span>
                                <p className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">{monthlyActivationRevenue.toLocaleString()} ৳</p>
                                <span className="text-[9px] text-pink-100 block">ধরা হয়েছে ইউজারদের ১৫% এক্টিভ করবে</span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] text-pink-200 block uppercase font-bold tracking-widest">গুগল বিজ্ঞাপন থেকে লাভ</span>
                                <p className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">{monthlyAdRevenue.toLocaleString()} ৳</p>
                                <span className="text-[9px] text-pink-100 block">গড় বিজ্ঞাপনের লাভ ১.৫০ ৳ করে</span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] text-pink-200 block uppercase font-bold tracking-widest">রিসেল প্রোডাক্ট কমিশন</span>
                                <p className="text-xl sm:text-2xl font-black text-yellow-300 font-mono">{monthlyResellRevenue.toLocaleString()} ৳</p>
                                <span className="text-[9px] text-pink-100 block">প্রতি ইউজারের ২টি করে ডেলিভারি অর্ডার</span>
                            </div>

                            <div className="p-3.5 bg-white/10 rounded-2xl border border-white/20 flex flex-col justify-center space-y-1 text-center font-sans">
                                <span className="text-[10px] text-yellow-200 uppercase font-black tracking-widest">আপনার মাসিক মোট লাভ</span>
                                <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono leading-none">
                                    {totalMonthlyOwnerProfit.toLocaleString()} ৳
                                </p>
                                <span className="text-[9px] text-white/80">১০০% সম্পূর্ণ ওনার রেভিনিউ প্রফিট</span>
                            </div>
                        </div>

                        {/* Helpful Tips Alert indicator */}
                        <div className="bg-purple-50 p-4 border border-purple-100/80 rounded-2xl text-[11px] sm:text-xs text-purple-950 flex gap-2.5 leading-relaxed">
                            <AlertCircle size={18} className="text-purple-700 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <strong className="text-purple-950">💡 গুরুত্বপূর্ণ ওনার টিপস:</strong>
                                <p className="text-gray-650">
                                    ১. ইউজারদের থেকে অর্জিত আইডি এক্টিভেশন ফি সরাসরি আপনার বিকাশ বা নগদ নাম্বারে পাবেন, কারণ তারা ডিপোজিটের মাধ্যমে ওই ফি প্রদান করেছে।
                                </p>
                                <p className="text-gray-650">
                                    ২. ক্যাশআউট বা উইথড্র করার সময় ইউজারদের পেমেন্ট দেওয়ার দায়িত্ব আপনার। যেহেতু তাদের সম্পূর্ণ টাকা আপনার ব্যক্তিগত বিকাশ/নগদ নাম্বারে জমা হচ্ছে, তাই রিকোয়েস্ট সাবমিট হলে আপনি আপনার মোবাইল ফাইন্যান্সিয়াল অ্যাপ থেকে ম্যানুয়ালি তাদের অ্যাকাউন্টে পেমেন্ট করে রিকোয়েস্ট সফল বা এপ্রুভ করে দেবেন।
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}
