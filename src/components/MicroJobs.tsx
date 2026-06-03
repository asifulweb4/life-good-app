import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, DollarSign, CheckCircle2, ChevronRight, UploadCloud,
  Link as LinkIcon, FileText, AlertCircle, Play, Timer, HelpCircle,
  BookOpen, Calculator, Sparkles, Languages, Check, X,
  Lock, Unlock, Keyboard, FileSignature
} from 'lucide-react';
import { Job } from '../types';

interface MicroJobsProps {
  jobs: Job[];
  onJobSuccess: (reward: number, jobTitle: string) => void;
  onUpdateJobs: (updatedJobs: Job[]) => void;
  userEmail?: string;
  transactions?: any[];
  onNavigateToWallet?: () => void;
}

export default function MicroJobs({
  jobs,
  onJobSuccess,
  onUpdateJobs,
  userEmail,
  transactions = [],
  onNavigateToWallet
}: MicroJobsProps) {
  // Deposit limit/blocking variables
  const totalSuccessDeposits = (transactions || [])
    .filter((t: any) => t.type === 'deposit' && t.status === 'success')
    .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

  const hasPendingDeposit20 = (transactions || [])
    .some((t: any) => t.type === 'deposit' && t.status === 'pending' && Number(t.amount || 0) >= 20);

  const isDepositUnlocked = totalSuccessDeposits >= 20 || hasPendingDeposit20;

  // Navigation tabs for job categories
  const [activeCategory, setActiveCategory] = useState<'social' | 'video' | 'math' | 'spelling' | 'captcha' | 'typing'>('social');
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  // States for Social Job Proof submission
  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [loading, setLoading] = useState(false);

  // States for Interactive Video Watch Job
  const [videoTimer, setVideoTimer] = useState(0);
  const [isVideoWatching, setIsVideoWatching] = useState(false);
  const [watchedVideoId, setWatchedVideoId] = useState<string | null>(null);
  const [claimedVideoIds, setClaimedVideoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('claimedVideoIds');
    return saved ? JSON.parse(saved) : [];
  });

  // States for Math Solving Arena
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'+' | '-' | '*'>('+');
  const [mathUserAnswer, setMathUserAnswer] = useState('');
  const [mathChecked, setMathChecked] = useState(false);
  const [mathIsCorrect, setMathIsCorrect] = useState(false);
  const [mathStreak, setMathStreak] = useState(() => Number(localStorage.getItem('mathStreak') || '0'));
  const [mathLimit, setMathLimit] = useState(() => Number(localStorage.getItem('mathLimit') || '10')); // max 10 a day

  // States for Bengali Spelling Quiz
  const [spellingIndex, setSpellingIndex] = useState(0);
  const [selectedSpelling, setSelectedSpelling] = useState<string | null>(null);
  const [spellingChecked, setSpellingChecked] = useState(false);
  const [spellingIsCorrect, setSpellingIsCorrect] = useState(false);
  const [completedSpellingIds, setCompletedSpellingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedSpellingIds');
    return saved ? JSON.parse(saved) : [];
  });

  // States for Captcha Work Arena
  const [captchaText, setCaptchaText] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaIsCorrect, setCaptchaIsCorrect] = useState(false);
  const [captchaLimit, setCaptchaLimit] = useState(() => Number(localStorage.getItem('captchaLimit') || '15')); // max 15 a day
  const [captchaStreak, setCaptchaStreak] = useState(() => Number(localStorage.getItem('captchaStreak') || '0'));

  // States for Typing Work Arena
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingAnswer, setTypingAnswer] = useState('');
  const [typingChecked, setTypingChecked] = useState(false);
  const [typingIsCorrect, setTypingIsCorrect] = useState(false);
  const [typingLimit, setTypingLimit] = useState(() => Number(localStorage.getItem('typingLimit') || '10')); // max 10 a day

  const spellingQuizList = [
    { id: 'sp1', word: "নিচের কোন বানানটি ব্যাকরণগতভাবে সঠিক?", options: ["সমীচিন", "সমীচীন", "সমিচীন", "সমিচিন"], correct: "সমীচীন", reward: 2.50, meaning: "সঠিক বা যুক্তিযুক্ত" },
    { id: 'sp2', word: "নিচের কোনটি সঠিক বানান চিহ্নিত করুন?", options: ["বুদ্ধিজীবি", "বুদ্ধিজিবি", "বুদ্ধিজীবী", "বুদ্ধিজিবিী"], correct: "বুদ্ধিজীবী", reward: 2.00, meaning: "intellectual" },
    { id: 'sp3', word: "সঠিক বানানের বিকল্পটি বেছে নিন:", options: ["পিপীলিকা", "পিপিলিকা", "পীপিীলিকা", "পীপীলীকা"], correct: "পিপীলিকা", reward: 2.20, meaning: "পিঁপড়া" },
    { id: 'sp4', word: "কোন বানানটি শুদ্ধ বা হালাল?", options: ["শ্রদ্ধাঞ্জলী", "শ্রদ্ধাঞ্জলি", "সরদ্ধাঞ্জলি", "স্রদ্ধাঞ্জলী"], correct: "শ্রদ্ধাঞ্জলি", reward: 1.80, meaning: "সম্মান প্রদর্শনামূলক অর্ঘ্য" },
    { id: 'sp5', word: "নিচের কোনটি শুদ্ধ রূপ?", options: ["দারিদ্রতা", "দরিদ্রতা", "দারীদ্রতা", "দরিদ্রতাী"], correct: "দরিদ্রতা", reward: 2.50, meaning: "গরিব দশা বা অভাব" }
  ];

  const typingQuizList = [
    { id: 'tp1', text: "লাইফ গুড প্ল্যাটফর্ম বিশ্বাস করে হালাল ও সৎ পথে পরিশ্রম করার মাঝে আসল বরকত রয়েছে।", reward: 3.00, desc: "উপরের বাক্যটি হুবহু নিচে টাইপ করুন।" },
    { id: 'tp2', text: "আজকের দিনটি আপনার জীবনের অন্যতম সেরা দিন করার সুযোগ কেবল আপনার অলসতা ত্যাগের মাধ্যমেই সম্ভব।", reward: 3.50, desc: "উপরের বাক্যটি নিখুঁতভাবে টাইপ করুন।" },
    { id: 'tp3', text: "যদি আপনি প্রতিদিন নতুন কিছু শেখার আগ্রহ ধরে রাখতে পারেন তবে সফলতা আপনার খুব সন্নিকটে থাকবে।", reward: 3.00, desc: "কোনো বানান বা স্পেস ভুল না করে টাইপ করুন।" },
    { id: 'tp4', text: "সচ্চরিত্রতা এবং ধৈর্যশীলতা কর্মজীবনে যেকোনো বড় বাধা অতিক্রম করার সবচেয়ে কার্যকারী হাতিয়ার।", reward: 4.00, desc: "নিখুঁতভাবে বাংলায় টাইপিং সম্পন্ন করুন।" }
  ];

  const videosList = [
    { id: 'vid1', title: "হালাল উপায়ে মোবাইল দিয়ে ফ্রিল্যান্সিং করার গোপন ট্রিকস", reward: 2.00, embedId: "8I_asT6wTsc", desc: "১৫ সেকেন্ড ভিডিওটি মনোযোগ দিয়ে দেখুন এবং আপনার ব্যালান্স নিশ্চিত করুন।" },
    { id: 'vid2', title: "লাইফ গুড রিসেলিং পণ্য বিক্রি করার সঠিক টেকনিক গাইড", reward: 2.50, embedId: "S_vO_0C5Wsc", desc: "পূর্ণ গাইডলাইন বুঝে নিতে ১৫ সেকেন্ড ভিডিও সেশনটি দেখুন।" },
    { id: 'vid3', title: "সোশ্যাল মিডিয়া ফেসবুক বা ইউটিউবে ট্রাফিক বৃদ্ধির সিক্রেট", reward: 2.20, embedId: "L1vS_iO2aDo", desc: "বড় টিম গড়ে তোলার জন্য ১৫ সেকেন্ড ভিডিও টিউটোরিয়াল সেশনটি ওয়াচ করুন।" }
  ];

  // Save Claimed Videos & Spellings
  useEffect(() => {
    localStorage.setItem('claimedVideoIds', JSON.stringify(claimedVideoIds));
  }, [claimedVideoIds]);

  useEffect(() => {
    localStorage.setItem('completedSpellingIds', JSON.stringify(completedSpellingIds));
  }, [completedSpellingIds]);

  useEffect(() => {
    localStorage.setItem('mathStreak', mathStreak.toString());
    localStorage.setItem('mathLimit', mathLimit.toString());
  }, [mathStreak, mathLimit]);

  useEffect(() => {
    localStorage.setItem('captchaLimit', captchaLimit.toString());
    localStorage.setItem('captchaStreak', captchaStreak.toString());
  }, [captchaLimit, captchaStreak]);

  useEffect(() => {
    localStorage.setItem('typingLimit', typingLimit.toString());
  }, [typingLimit]);

  // Video Watch Count Down Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoWatching && videoTimer > 0) {
      interval = setInterval(() => {
        setVideoTimer((prev) => prev - 1);
      }, 1000);
    } else if (videoTimer === 0 && isVideoWatching) {
      setIsVideoWatching(false);
    }
    return () => clearInterval(interval);
  }, [isVideoWatching, videoTimer]);

  const selectJob = (job: Job) => {
    setActiveJob(job);
    setProofText('');
    setProofFile(null);
    setFileName('');
    setSubmissionSuccess(false);
    setSubmissionError('');

    // Smooth scroll to details on small/mobile screens
    setTimeout(() => {
      const element = document.getElementById('active-job-detail');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setProofFile(file);
      setFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFile(file);
      setFileName(file.name);
    }
  };

  // Submit standard social job proof to server
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    if (!proofText && !proofFile) {
      setSubmissionError('⚠️ স্ক্রিনশট ফাইল আপলোড করুন অথবা প্রমাণস্বরূপ লিংক/টেক্সট প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = user.email || userEmail || 'guest@lifegood.com';

      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          jobId: activeJob.id,
          reward: activeJob.reward,
          title: activeJob.title
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'প্রমাণ সাবমিট করা যায়নি।');
      }

      // Successful
      onJobSuccess(activeJob.reward, activeJob.title);

      // Mutate jobs state
      const updated = jobs.map((j) => {
        if (j.id === activeJob.id) {
          return { ...j, isCompleted: true, completedCount: j.completedCount + 1 };
        }
        return j;
      });
      onUpdateJobs(updated);

      setSubmissionSuccess(true);
      setSubmissionError('');
    } catch (err: any) {
      setSubmissionError(err.message || 'একটি নেটওয়ার্ক সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  // INTERACTIVE: Start video timer
  const startWatchingVideo = (id: string) => {
    setWatchedVideoId(id);
    setVideoTimer(15); // Require 15 seconds watching
    setIsVideoWatching(true);

    // Smooth scroll to active player on small/mobile screens
    setTimeout(() => {
      const element = document.getElementById('active-video-player');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // INTERACTIVE: Claim Video Income
  const claimVideoIncome = async (id: string, reward: number, title: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = user.email || userEmail || 'guest@lifegood.com';

      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          jobId: id,
          reward,
          title: `লানিং ভিডিও ওয়াচ: ${title}`
        })
      });

      const data = await response.json();
      if (response.ok) {
        setClaimedVideoIds((prev) => [...prev, id]);
        onJobSuccess(reward, `ভিডিও ওয়াচ: ${title}`);
        alert(`🎉 অভিনন্দন! ভিডিও ওয়াচ ক্লেইম সফল হয়েছে। আপনার ওয়ালেটে ${reward} ৳ যোগ করা হয়েছে।`);
      } else {
        alert(data.error || 'ইতিপূর্বে ক্লেইম করেছেন!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // INTERACTIVE: Math solver generator
  const generateNewMathQuestion = () => {
    const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const selectedOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = 0;
    let n2 = 0;

    if (selectedOp === '+') {
      n1 = Math.floor(Math.random() * 80) + 10;
      n2 = Math.floor(Math.random() * 80) + 10;
    } else if (selectedOp === '-') {
      n1 = Math.floor(Math.random() * 90) + 10;
      n2 = Math.floor(Math.random() * (n1 - 5)) + 4; // Ensure positive diff
    } else {
      n1 = Math.floor(Math.random() * 9) + 2;
      n2 = Math.floor(Math.random() * 9) + 2;
    }

    setMathNum1(n1);
    setMathNum2(n2);
    setMathOp(selectedOp);
    setMathUserAnswer('');
    setMathChecked(false);
    setMathIsCorrect(false);
  };

  useEffect(() => {
    generateNewMathQuestion();
  }, []);

  const handleVerifyMath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mathLimit <= 0) {
      alert('⚠️ আজ আপনার অংক করার দৈনিক সীমা শেষ হয়েছে! আগামীকাল আবার চেষ্টা করুন।');
      return;
    }

    let correctAnswer = 0;
    if (mathOp === '+') correctAnswer = mathNum1 + mathNum2;
    else if (mathOp === '-') correctAnswer = mathNum1 - mathNum2;
    else if (mathOp === '*') correctAnswer = mathNum1 * mathNum2;

    const parsedUserAnswer = parseInt(mathUserAnswer.trim(), 10);
    setMathChecked(true);

    if (parsedUserAnswer === correctAnswer) {
      setMathIsCorrect(true);
      setMathStreak((prev) => prev + 1);
      setMathLimit((prev) => prev - 1);

      // Reward on backend
      const reward = 2.00; // 2 Tk for each math
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';

        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            jobId: `math_solve_${Date.now()}`,
            reward,
            title: `গণিত সমাধান সম্পূর্ণ (ক্লেইমড)`
          })
        });

        onJobSuccess(reward, `অংক সমাধান টাস্ক: ${mathNum1} ${mathOp} ${mathNum2} = ${correctAnswer}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setMathIsCorrect(false);
      setMathStreak(0);
    }
  };

  // INTERACTIVE: Spell Checker submission
  const verifySpellingChoice = async (option: string) => {
    if (spellingChecked) return;

    setSelectedSpelling(option);
    setSpellingChecked(true);
    const quiz = spellingQuizList[spellingIndex];

    if (option === quiz.correct) {
      setSpellingIsCorrect(true);
      const reward = quiz.reward;

      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';

        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            jobId: `spell_quiz_${quiz.id}`,
            reward,
            title: `বানান শুদ্ধিকরণ কুইজ: ${quiz.correct}`
          })
        });

        setCompletedSpellingIds((prev) => [...prev, quiz.id]);
        onJobSuccess(reward, `বানান শুদ্ধিকরণ: ${quiz.correct}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSpellingIsCorrect(false);
    }
  };

  const nextSpellingQuiz = () => {
    setSelectedSpelling(null);
    setSpellingChecked(false);
    setSpellingIsCorrect(false);
    setSpellingIndex((prev) => (prev + 1) % spellingQuizList.length);
  };

  // INTERACTIVE: Generate New Captcha Text
  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setCaptchaAnswer('');
    setCaptchaChecked(false);
    setCaptchaIsCorrect(false);
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  // INTERACTIVE: Verify Captcha Submission
  const handleVerifyCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaLimit <= 0) {
      alert('⚠️ আজ আপনার ক্যাপচা পূরণের দৈনিক সীমা শেষ হয়েছে! আগামীকাল আবার চেষ্টা করুন।');
      return;
    }

    setCaptchaChecked(true);
    const isCorrect = captchaAnswer.trim() === captchaText;

    if (isCorrect) {
      setCaptchaIsCorrect(true);
      setCaptchaStreak((prev) => prev + 1);
      setCaptchaLimit((prev) => prev - 1);

      // Submit reward
      const reward = 1.50; // 1.50 TK per captcha
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';

        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            jobId: `captcha_solve_${Date.now()}`,
            reward,
            title: `ক্যাপচা সমাধান সম্পূর্ণ (রিওয়ার্ড)`
          })
        });

        onJobSuccess(reward, `ক্যাপচা সমাধান: ${captchaText}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCaptchaIsCorrect(false);
      setCaptchaStreak(0);
    }
  };

  // INTERACTIVE: Verify Typing Task Submission
  const handleVerifyTyping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typingLimit <= 0) {
      alert('⚠️ আজ আপনার টাইপিং সীমার দৈনিক সীমা শেষ হয়েছে। আগামীকাল চেষ্টা করুন।');
      return;
    }

    const currentQuiz = typingQuizList[typingIndex];
    setTypingChecked(true);

    const cleanInput = typingAnswer.trim().replace(/\s+/g, ' ');
    const cleanTarget = currentQuiz.text.trim().replace(/\s+/g, ' ');
    const isCorrect = cleanInput === cleanTarget;

    if (isCorrect) {
      setTypingIsCorrect(true);
      setTypingLimit((prev) => prev - 1);

      const reward = currentQuiz.reward;
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';

        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            jobId: `typing_task_${currentQuiz.id}_${Date.now()}`,
            reward,
            title: `টাইপিং টাস্ক সম্পন্ন (রিওয়ার্ড)`
          })
        });

        onJobSuccess(reward, `টাইপিং টাস্ক সফলভাবে সম্পন্ন`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setTypingIsCorrect(false);
    }
  };

  const nextTypingQuiz = () => {
    setTypingAnswer('');
    setTypingChecked(false);
    setTypingIsCorrect(false);
    setTypingIndex((prev) => (prev + 1) % typingQuizList.length);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6" id="micro-jobs">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 relative overflow-hidden" id="jobs-header-banner">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">রিয়েল ইনকাম মাইক্রো টাস্ক</h1>
            <p className="text-xs sm:text-sm opacity-95">
              হালাল উপায়ে ভিডিও দেখে, গণিত সমাধান করে কিংবা সহীহ বাংলা বানান নির্ণয় করে আপনার দৈনন্দিন নিশ্চিত আয়ের পরিধি বাড়ান!
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl min-w-36 text-center border border-white/20">
            <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-widest block">টাস্ক পেমেন্ট</span>
            <p className="text-2xl font-black mt-1 text-white">ইনস্ট্যান্ট বিকাশ</p>
          </div>
        </div>
      </div>

      {/* Category Selection or Locking Block */}
      {!isDepositUnlocked ? (
        hasPendingDeposit20 ? (
          <div className="bg-white/95 backdrop-blur rounded-3xl border border-amber-200 p-6 sm:p-8 text-center space-y-6 shadow-xl shadow-amber-50/50 max-w-xl mx-auto border-t-4 border-t-amber-500">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-500">
              <Timer size={32} className="animate-pulse" />
            </div>

            <div className="space-y-2 select-none">
              <h2 className="text-xl sm:text-2xl font-black text-amber-950">⏳ ডিপোজিট যাচাইকরণাধীন...</h2>
              <p className="text-xs sm:text-sm text-purple-800 font-semibold leading-relaxed">
                আপনার ২০ টাকা বা তার বেশি ডিপোজিট ট্রানজেকশনের আবেদনটি আমরা পেয়েছি এবং বর্তমানে রিভিউ করা হচ্ছে।
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                এডমিন অতিসত্বর আপনার ট্রানজেকশন আইডি (TrxID) ভেরিফাই করে অনুমোদন দিয়ে দিবে। এর পরপরই কাজগুলো স্বয়ংক্রিয়ভাবে ওপেন হয়ে যাবে। অনুগ্রহ করে অপেক্ষা করুন।
              </p>
            </div>

            <button
              onClick={onNavigateToWallet}
              className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl cursor-pointer transition-colors"
            >
              ডিপোজিট হিস্ট্রি দেখতে ওয়ালেটে যান 📋
            </button>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-150 p-6 sm:p-8 text-center space-y-6 shadow-xl shadow-purple-50/50 max-w-xl mx-auto border-t-4 border-t-purple-600">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-purple-600">
              <Lock size={32} className="animate-pulse" />
            </div>

            <div className="space-y-2 select-none">
              <h2 className="text-xl sm:text-2xl font-black text-purple-950">🔒 মাইক্রো জবস সেকশন লকড আছে!</h2>
              <p className="text-xs sm:text-sm text-purple-605 text-gray-600 font-semibold leading-relaxed">
                মাইক্রো কাজগুলো (সোশ্যাল কাজ, ভিডিও ওয়াচ, অংক করুন, বানান শুদ্ধিকরণ, ক্যাপচা টাইপিং এবং স্পেশাল টাইপিং টাস্ক) সম্পন্ন করে রিয়েল ইনকাম করতে হলে আপনার একাউন্টে কমপক্ষে ২০ টাকা ডিপোজিট থাকতে হবে।
              </p>
            </div>

            <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 divide-y divide-purple-100/60 text-xs text-purple-950 space-y-3">
              <div className="flex items-center justify-between pb-2 font-bold">
                <span>নূন্যতম রিকোয়ার্ড ডিপোজিট:</span>
                <span className="text-pink-600 font-black">২০.০০ ৳</span>
              </div>
              <div className="flex items-center justify-between pt-2 pb-1 font-bold font-sans">
                <span>আপনার মোট সফল ডিপোজিট ব্যালেন্স:</span>
                <span className="text-purple-950 font-black font-mono">{totalSuccessDeposits.toFixed(2)} ৳</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={onNavigateToWallet}
                className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Unlock size={16} /> ওয়ালেটে গিয়ে ২০ ৳ ডিপোজিট করুন
              </button>
              <p className="text-[10px] text-gray-500 font-medium">
                * বিকাশ বা নগদের মাধ্যমে পেমেন্ট করে ট্রানজেকশন ID সাবমিট করার সাথে সাথেই এডমিন যাচাই করে আপনার একাউন্ট ও কাজগুলো আনলক করে দিবে।
              </p>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Category Selection Tabs */}
          <div className="flex overflow-x-auto gap-2 p-1 bg-purple-50 rounded-2xl border border-purple-100/40 no-scrollbar" id="category-navigation">
            <button
              onClick={() => setActiveCategory('social')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === 'social'
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-100/50'
                }`}
            >
              <Briefcase size={14} /> সামাজিক কাজ ({jobs.length})
            </button>
            <button
              onClick={() => setActiveCategory('video')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === 'video'
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-100/50'
                }`}
            >
              <Play size={14} /> ভিডিও দেখুন
            </button>
            <button
              onClick={() => setActiveCategory('math')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === 'math'
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-100/50'
                }`}
            >
              <Calculator size={14} /> অংক করুন
            </button>
            <button
              onClick={() => setActiveCategory('spelling')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === 'spelling'
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-100/50'
                }`}
            >
              <Languages size={14} /> বানান শুদ্ধিকরণ
            </button>
            <button
              onClick={() => setActiveCategory('captcha')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === 'captcha'
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-100/50'
                }`}
            >
              <Keyboard size={14} /> ক্যাপচা টাইপিং
            </button>
            <button
              onClick={() => setActiveCategory('typing')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === 'typing'
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                  : 'text-purple-600 hover:bg-purple-100/50'
                }`}
            >
              <FileSignature size={14} /> টাইপিং টাস্ক
            </button>
          </div>

          {/* Main View Area of current chosen Category */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Dynamic Left Column / Layout depending on tabs */}
            <div className="md:col-span-7 space-y-4">

              {/* TAB 1: SOCIAL JOBS LISTING */}
              {activeCategory === 'social' && (
                <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                  <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 border-b border-purple-50 pb-2">
                    <Briefcase size={16} /> সোশ্যাল মাইক্রো টাস্ক সমুহ ({jobs.length})
                  </h3>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => selectJob(job)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${activeJob?.id === job.id
                            ? 'bg-purple-50 border-purple-300 shadow-md'
                            : 'bg-white border-purple-100/60 hover:border-purple-200 hover:bg-purple-50/25'
                          }`}
                        id={`job-card-${job.id}`}
                      >
                        <div className="space-y-2 flex-grow">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                              {job.category}
                            </span>
                            {job.isCompleted && (
                              <span className="text-[9px] font-bold text-center px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-150 rounded-full flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> সম্পূর্ণ
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-purple-950 text-xs sm:text-sm leading-snug line-clamp-2">
                            {job.title}
                          </h4>
                          <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: `${(job.completedCount / job.subscribersNeeded) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-[9px] text-gray-400 font-medium">
                            অগ্রগতি: {job.completedCount}/{job.subscribersNeeded} সম্পূর্ণ
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 font-mono shrink-0">
                          <p className="font-extrabold text-pink-600 text-sm">+{Number(job.reward).toFixed(2)} ৳</p>
                          <ChevronRight size={14} className="text-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE VIDEO JOB LISTING */}
              {activeCategory === 'video' && (
                <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                  <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 border-b border-purple-50 pb-2">
                    <Play size={16} className="text-pink-500" /> শিক্ষানবিশ ভিডিও কাজ সমুহ ({videosList.length})
                  </h3>

                  <div className="space-y-4">
                    {videosList.map((video) => {
                      const isClaimed = claimedVideoIds.includes(video.id);
                      const isWatchingThis = watchedVideoId === video.id;

                      return (
                        <div key={video.id} className="p-4 bg-purple-50/20 border border-purple-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black tracking-wider px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full uppercase">
                                Video Course Task
                              </span>
                              {isClaimed && (
                                <span className="text-[9px] font-bold text-center px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-150 rounded-full flex items-center gap-0.5">
                                  <CheckCircle2 size={10} /> রিভিও প্রাপ্ত
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-purple-950 text-xs sm:text-sm">{video.title}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{video.desc}</p>
                          </div>

                          <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 text-right shrink-0">
                            <span className="text-pink-600 font-black text-sm font-mono block">+{Number(video.reward).toFixed(2)} ৳</span>
                            {isClaimed ? (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-150 shrink-0">কমপ্লিট</span>
                            ) : isWatchingThis && videoTimer > 0 ? (
                              <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-xl font-bold shrink-0">
                                <Timer size={12} className="animate-spin text-amber-600" />
                                <span>{videoTimer} সেকেন্ড...</span>
                              </div>
                            ) : isWatchingThis && videoTimer === 0 ? (
                              <button
                                onClick={() => claimVideoIncome(video.id, video.reward, video.title)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md shadow-emerald-50"
                              >
                                টাকা ক্লেইম করুন ৳
                              </button>
                            ) : (
                              <button
                                onClick={() => startWatchingVideo(video.id)}
                                className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer shadow shadow-purple-200"
                              >
                                <Play size={10} /> ভিডিও দেখুন
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: MATH QUIZ ENGINE */}
              {activeCategory === 'math' && (
                <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                  <div className="flex justify-between items-center border-b border-purple-50 pb-2 select-none">
                    <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5">
                      <Calculator size={16} className="text-purple-600" /> গণিত সমাধান এরিনা
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-100/40 px-2 py-0.5 rounded-full">
                        আজ বাকি: {mathLimit} বার
                      </span>
                      <span className="text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-100 py-0.5 px-2 rounded-full">
                        টানা স্কোর: {mathStreak} 🔥
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-purple-50/40 to-white border border-purple-100 rounded-2xl p-5 text-center">
                    <p className="text-xs text-purple-700 font-extrabold mb-4 flex items-center justify-center gap-1">
                      <Sparkles size={14} className="text-pink-500 animate-pulse" /> দ্রুত হিসাব করে সঠিক উত্তর ক্লেইম করুন!
                    </p>

                    <div className="my-6 inline-flex items-center justify-center gap-4 bg-purple-50/80 px-8 py-4 rounded-3xl border border-purple-200 shadow-inner select-none">
                      <span className="text-3xl font-black text-purple-950 font-mono">{mathNum1}</span>
                      <span className="text-2xl font-black text-pink-600 font-mono">{mathOp === '*' ? '×' : mathOp}</span>
                      <span className="text-3xl font-black text-purple-950 font-mono">{mathNum2}</span>
                      <span className="text-2xl font-black text-purple-300 font-mono">=</span>
                      <span className="text-3xl font-black text-pink-600 font-mono animate-bounce">?</span>
                    </div>

                    <form onSubmit={handleVerifyMath} className="max-w-xs mx-auto space-y-3">
                      <input
                        type="number"
                        required
                        disabled={mathChecked && mathIsCorrect}
                        value={mathUserAnswer}
                        onChange={(e) => setMathUserAnswer(e.target.value)}
                        placeholder="সঠিক উত্তর টাইপ করুন"
                        className="w-full text-center text-lg font-bold font-mono bg-white border-2 border-purple-150 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-300"
                      />

                      <AnimatePresence mode="wait">
                        {mathChecked && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${mathIsCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-100'
                              }`}
                          >
                            {mathIsCorrect ? (
                              <>
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span>আহ্লাদ! সঠিক উত্তর দিয়ে +২.০০ ৳ লাভ করেছেন!</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={14} className="text-red-500" />
                                <span>ভুল উত্তর। আবার চেষ্টা করুন! সঠিক ছিল: {mathOp === '+' ? mathNum1 + mathNum2 : mathOp === '-' ? mathNum1 - mathNum2 : mathNum1 * mathNum2}</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2.5">
                        {mathChecked && (
                          <button
                            type="button"
                            onClick={generateNewMathQuestion}
                            className="flex-1 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl cursor-pointer border border-purple-200 transition-colors"
                          >
                            নতুন অংক
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={mathUserAnswer === '' || (mathChecked && mathIsCorrect)}
                          className="flex-[2] py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          উত্তর জমা দিন
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: BENGALI SPELLING QUIZ */}
              {activeCategory === 'spelling' && (
                <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                  <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 border-b border-purple-50 pb-2 select-none">
                    <Languages size={16} className="text-pink-500" /> বানান শুদ্ধিকরণ কুইজ
                  </h3>

                  {(() => {
                    const quiz = spellingQuizList[spellingIndex];
                    const isClaimedId = completedSpellingIds.includes(quiz.id);

                    return (
                      <div key={quiz.id} className="space-y-4">
                        <div className="flex justify-between items-center bg-purple-50/40 p-3 rounded-2xl border border-purple-100/60 select-none">
                          <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full uppercase">
                            প্রশ্ন {spellingIndex + 1}/{spellingQuizList.length}
                          </span>
                          <span className="text-pink-600 font-extrabold text-xs font-mono">
                            পুরস্কার: +{Number(quiz.reward).toFixed(2)} ৳
                          </span>
                        </div>

                        <h4 className="font-extrabold text-purple-950 text-sm py-2 leading-relaxed">
                          {quiz.word}
                        </h4>

                        {/* Quiz choices */}
                        <div className="grid grid-cols-2 gap-3.5">
                          {quiz.options.map((opt) => {
                            const isSelected = selectedSpelling === opt;
                            const isCorrectOpt = quiz.correct === opt;

                            let cardStyle = "border-purple-100/60 bg-white text-purple-900 hover:bg-purple-50/30";
                            if (spellingChecked) {
                              if (isCorrectOpt) {
                                cardStyle = "border-emerald-300 bg-emerald-50 text-emerald-800";
                              } else if (isSelected && !isCorrectOpt) {
                                cardStyle = "border-red-300 bg-red-50 text-red-700";
                              } else {
                                cardStyle = "border-purple-50 bg-gray-50/40 opacity-55 text-gray-400";
                              }
                            } else if (isSelected) {
                              cardStyle = "border-purple-600 bg-purple-50 text-purple-950";
                            }

                            return (
                              <button
                                key={opt}
                                disabled={spellingChecked}
                                onClick={() => verifySpellingChoice(opt)}
                                className={`p-3 text-center text-xs font-bold rounded-2xl border cursor-pointer transition-all ${cardStyle}`}
                              >
                                {opt}
                                {spellingChecked && isCorrectOpt && (
                                  <span className="inline-block ml-1 text-emerald-600">✓</span>
                                )}
                                {spellingChecked && isSelected && !isCorrectOpt && (
                                  <span className="inline-block ml-1 text-red-500">✗</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explain meaning */}
                        {spellingChecked && (
                          <div className="p-3 bg-purple-50/60 rounded-xl text-xs border border-purple-100/40 text-purple-950 font-semibold leading-relaxed">
                            🔍 বানানের অর্থ বা বিবরণ:<br />
                            <span className="text-gray-600 font-medium mt-0.5 inline-block">{quiz.meaning}</span>
                          </div>
                        )}

                        {/* Feedback message */}
                        <AnimatePresence mode="wait">
                          {spellingChecked && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-3 rounded-xl text-xs font-bold text-center ${spellingIsCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}
                            >
                              {spellingIsCorrect ? (
                                <span>অভিনন্দন! সঠিক বানান নির্বাচন করে আপনি পুরস্কৃত হয়েছেন! 🎉</span>
                              ) : (
                                <span>উফস! আপনার উত্তরটি ভুল। পরবর্তী কুইজে চলে যান।</span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Navigation control */}
                        <button
                          onClick={nextSpellingQuiz}
                          className="w-full py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs rounded-xl cursor-pointer text-center border border-purple-200/50"
                        >
                          পরবর্তী কুইজ দেখুন
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: CAPTCHA WORK ARENA */}
              {activeCategory === 'captcha' && (
                <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                  <div className="flex justify-between items-center border-b border-purple-50 pb-2 select-none">
                    <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5">
                      <Keyboard size={16} className="text-purple-600" /> সুরক্ষিত ক্যাপচা টাইপিং
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-100/40 px-2 py-0.5 rounded-full">
                        আজ বাকি: {captchaLimit} বার
                      </span>
                      <span className="text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-100 py-0.5 px-2 rounded-full">
                        টানা স্কোর: {captchaStreak} 🔥
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-purple-50/40 to-white border border-purple-100 rounded-2xl p-5 text-center">
                    <p className="text-xs text-purple-700 font-extrabold mb-4 flex items-center justify-center gap-1">
                      <Sparkles size={14} className="text-pink-500 animate-pulse" /> নিখুঁতভাবে কেস-সেন্সিティブ ক্যাপচা সমাধান করুন!
                    </p>

                    {/* Secure Security CAPTCHA Visual Panel */}
                    <div className="my-6 inline-flex flex-col items-center justify-center bg-purple-950/95 px-8 py-5 rounded-3xl border-2 border-purple-800 shadow-inner select-none relative overflow-hidden max-w-xs mx-auto">
                      <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-between py-2">
                        <div className="border-t border-white h-1 w-full skew-y-3"></div>
                        <div className="border-t border-white h-1 w-full -skew-y-6"></div>
                        <div className="border-t border-white h-1 w-full skew-y-12"></div>
                      </div>
                      <span className="text-3xl font-black text-white font-mono tracking-widest italic select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-pulse" style={{ letterSpacing: '0.35em' }}>
                        {captchaText}
                      </span>
                    </div>

                    <form onSubmit={handleVerifyCaptcha} className="max-w-xs mx-auto space-y-3">
                      <input
                        type="text"
                        required
                        disabled={captchaChecked && captchaIsCorrect}
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="ক্যাপচা কোড এখানে লিখুন"
                        className="w-full text-center text-lg font-bold font-mono bg-white border-2 border-purple-150 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none transition-all placeholder:text-gray-300"
                      />

                      <AnimatePresence mode="wait">
                        {captchaChecked && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${captchaIsCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-100'
                              }`}
                          >
                            {captchaIsCorrect ? (
                              <>
                                <CheckCircle2 size={14} className="text-emerald-600" />
                                <span>দারুণ! সঠিক ক্যাপচা দিয়ে +১.৫০ ৳ পেয়েছেন!</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={14} className="text-red-500" />
                                <span>ভুল ক্যাপচা। আবার ট্রাই করুন!</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={generateNewCaptcha}
                          className="flex-1 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl cursor-pointer border border-purple-200 transition-colors"
                        >
                          রিলোড ক্যাপচা 🔄
                        </button>
                        <button
                          type="submit"
                          disabled={captchaAnswer === '' || (captchaChecked && captchaIsCorrect)}
                          className="flex-[2] py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          কোড ভেরিফাই করুণ
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 6: TYPING WORK ARENA */}
              {activeCategory === 'typing' && (
                <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                  {(() => {
                    const currentQuiz = typingQuizList[typingIndex];
                    return (
                      <div key={currentQuiz.id} className="space-y-4">
                        <div className="flex justify-between items-center border-b border-purple-50 pb-2 select-none">
                          <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5">
                            <FileSignature size={16} className="text-purple-600" /> হালাল টাইপিং প্র্যাকটিস টাস্ক
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-100/40 px-2 py-0.5 rounded-full">
                              আজ বাকি: {typingLimit} বার
                            </span>
                            <span className="text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full font-mono">
                              পুরস্কার: +{Number(currentQuiz.reward).toFixed(2)} ৳
                            </span>
                          </div>
                        </div>

                        <div className="bg-purple-50/50 border border-purple-150 p-4 rounded-2xl select-all">
                          <p className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-1 select-none">নিচের বাক্যটি হুবহু নিচের বক্সে টাইপ করুন:</p>
                          <p className="text-sm font-extrabold text-purple-950 leading-relaxed font-sans select-all">{currentQuiz.text}</p>
                        </div>

                        <form onSubmit={handleVerifyTyping} className="space-y-4">
                          <textarea
                            rows={3}
                            required
                            disabled={typingChecked && typingIsCorrect}
                            value={typingAnswer}
                            onChange={(e) => setTypingAnswer(e.target.value)}
                            placeholder="ভুল ছাড়া বাংলায় হুবহু বাক্যটি টাইপ করুন..."
                            className="w-full text-xs sm:text-sm bg-white border-2 border-purple-150 focus:border-pink-300 rounded-2xl p-4 text-purple-950 focus:outline-none placeholder:text-gray-400 transition-all font-sans leading-relaxed resize-none"
                          />

                          <AnimatePresence mode="wait">
                            {typingChecked && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-3 rounded-xl text-xs font-bold text-center ${typingIsCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-red-50 text-red-700 border border-red-100'
                                  }`}
                              >
                                {typingIsCorrect ? (
                                  <span>অভিনন্দন! বাক্যটি সফলভাবে টাইপ করে আপনি +{currentQuiz.reward} ৳ লাভ করেছেন! 🎉</span>
                                ) : (
                                  <span>উফ! বানানে সামান্য ত্রুটি রয়েছে। কোনো ক্যারেক্টার বা স্পেস বাদ পড়েছে নাকি মিলিয়ে আবার চেষ্টা করুন।</span>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={nextTypingQuiz}
                              className="flex-1 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl cursor-pointer text-center border border-purple-200 transition-colors"
                            >
                              পরবর্তী বাক্য দেখুন
                            </button>
                            <button
                              type="submit"
                              disabled={typingAnswer === '' || (typingChecked && typingIsCorrect)}
                              className="flex-[2] py-3 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-40 transition-shadow"
                            >
                              টাইপিং কোয়ালিটি চেক করুন
                            </button>
                          </div>
                        </form>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            {/* Dynamic Right Column: Execution detail of chosen social job OR educational watch guide */}
            <div className="md:col-span-5">
              <AnimatePresence mode="wait">

                {activeCategory === 'social' && activeJob ? (
                  <motion.div
                    key={activeJob.id}
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.98, opacity: 0 }}
                    className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4"
                    id="active-job-detail"
                  >
                    <div className="flex justify-between items-start gap-4 select-none">
                      <div>
                        <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">
                          {activeJob.category} টাস্ক
                        </span>
                        <h3 className="font-extrabold text-purple-950 text-sm sm:text-base mb-1 leading-snug tracking-tight mt-1">
                          {activeJob.title}
                        </h3>
                      </div>
                      <p className="font-black text-pink-600 text-lg font-mono shrink-0">+{Number(activeJob.reward).toFixed(2)} ৳</p>
                    </div>

                    <p className="text-xs text-purple-600 bg-purple-50 p-3 rounded-xl border border-purple-100/50 leading-relaxed font-semibold">
                      📋 কাজের নির্দেশনা:<br />
                      <span className="text-gray-600 font-medium mt-1 inline-block">{activeJob.description}</span>
                    </p>

                    {activeJob.url && (
                      <a
                        href={activeJob.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 px-4 border border-purple-100 hover:border-purple-200 bg-purple-50/40 hover:bg-purple-50 text-purple-700 font-extrabold text-xs rounded-xl transition-all select-all font-sans"
                      >
                        <LinkIcon size={14} /> কাজের লিংকটি ওপেন করুন
                      </a>
                    )}

                    {submissionSuccess ? (
                      <div className="text-center py-5 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-150 p-4 select-none">
                        <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
                        <div className="space-y-1">
                          <h4 className="font-bold text-emerald-800 text-sm">প্রমাণ সফলভাবে জমা হয়েছে!</h4>
                          <p className="text-[10px] text-purple-800">
                            অভিনন্দন! প্রমাণপত্রটি সফলভাবে ভেরিফাইড হয়েছে এবং আপনার একাউন্ট ব্যালান্সে <strong>{activeJob.reward} ৳</strong> যোগ করা হয়েছে।
                          </p>
                        </div>
                      </div>
                    ) : activeJob.isCompleted ? (
                      <div className="text-center py-5 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-150 p-4 select-none">
                        <CheckCircle2 className="mx-auto text-emerald-600" size={32} />
                        <h4 className="font-bold text-emerald-800 text-sm">আপনি ইতিপূর্বে কাজটি সম্পন্ন করেছেন!</h4>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitProof} className="space-y-4 pt-1">
                        <h4 className="text-xs font-extrabold text-purple-950 uppercase border-b border-purple-50 pb-1 select-none">
                          কাজের প্রমাণ সাবমিট করুন
                        </h4>

                        {/* Drag-and-drop selector zone */}
                        <div
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-28 gap-2 ${dragActive
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/10'
                            }`}
                        >
                          <input
                            type="file"
                            id="proof-image-upload"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <label htmlFor="proof-image-upload" className="cursor-pointer flex flex-col items-center gap-1 select-none">
                            <UploadCloud size={24} className="text-purple-400" />
                            <span className="text-[11px] font-bold text-purple-900 leading-tight">
                              {fileName ? 'চেঞ্জ করুন' : 'প্রমাণ স্ক্রিনশট আপলোড দিন'}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">ড্র্যাগ অ্যান্ড ড্রপ অথবা ক্লিক করুন</span>
                          </label>
                          {fileName && (
                            <div className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-bold py-1 px-2.5 rounded-full select-none">
                              <FileText size={10} />
                              <span className="line-clamp-1 max-w-32">{fileName}</span>
                            </div>
                          )}
                        </div>

                        {/* Proof text */}
                        <div>
                          <label className="text-[11px] font-bold text-purple-950 block mb-1 font-sans select-none">প্রমাণস্বরূপ লেখা বা লিংক (ঐচ্ছিক)</label>
                          <input
                            type="text"
                            value={proofText}
                            onChange={(e) => setProofText(e.target.value)}
                            placeholder="ইউটিউব নাম, ইমেইল বা ফেসবুক লিংক দিন"
                            className="w-full text-xs bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none placeholder:text-gray-450"
                          />
                        </div>

                        {submissionError && (
                          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1 shrink-0 select-none">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{submissionError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-shadow"
                        >
                          {loading ? 'ভেরিফাই হচ্ছে...' : 'ভেরিফাই এবং সাবমিট প্রুফ'}
                        </button>
                      </form>
                    )}
                  </motion.div>
                ) : watchedVideoId ? (
                  // Embedded Video watching interactive frame mockup
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-4 shadow-xl shadow-purple-50/50 space-y-4"
                    id="active-video-player"
                  >
                    <div className="text-xs font-extrabold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200/45 flex items-center gap-1 select-none">
                      <Play size={14} className="text-pink-500 animate-pulse" />
                      <span>সক্রিয় ভিডিও প্লেয়ার সেশন</span>
                    </div>

                    <div className="rounded-2xl overflow-hidden aspect-video bg-purple-950 border border-purple-100 shadow-md relative">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videosList.find((v) => v.id === watchedVideoId)?.embedId}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100/60 text-center select-none">
                      <h4 className="font-extrabold text-purple-950 text-xs sm:text-sm leading-snug line-clamp-2">
                        {videosList.find((v) => v.id === watchedVideoId)?.title}
                      </h4>
                      {videoTimer > 0 ? (
                        <div className="mt-2 text-xs font-bold text-purple-700 flex items-center justify-center gap-1">
                          <Timer size={12} className="animate-spin text-purple-600" />
                          <span>ভিডিওতে রিওয়ার্ড নিশ্চিত করতে আরও {videoTimer} সেকেন্ড মনোযোগ দিয়ে দেখুন।</span>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs font-black text-emerald-700 flex items-center justify-center gap-1 font-sans">
                          <CheckCircle2 size={14} className="text-emerald-600 animate-bounce" />
                          <span>ভিডিও দেখা শেষ! নিচে ক্লেইম বাটনে চাপ দিলে আপনার একাউন্টে ব্যালান্স যোগ হবে।</span>
                        </div>
                      )}
                    </div>

                    {videoTimer === 0 && (
                      <button
                        onClick={() => {
                          const vObj = videosList.find((v) => v.id === watchedVideoId);
                          if (vObj) claimVideoIncome(vObj.id, vObj.reward, vObj.title);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer text-center shadow-lg shadow-emerald-50"
                      >
                        ৳ {Number(videosList.find((v) => v.id === watchedVideoId)?.reward).toFixed(2)} ইনকাম ক্লেইম করুন!
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-white/80 border border-purple-100 rounded-3xl p-8 text-center shadow-xl shadow-purple-50/50 max-w-xs mx-auto select-none">
                    <Briefcase size={36} className="mx-auto text-purple-300 mb-2.5 animate-bounce" style={{ animationDuration: '4s' }} />
                    <h4 className="font-extrabold text-purple-950 text-sm mb-1">কাজটি নির্বাচন করুন</h4>
                    <p className="text-xs text-purple-550 leading-relaxed font-semibold">
                      বামদিকের টাস্ক তালিকা বা স্পেশাল ট্যাব থেকে যেকোনো একটি কাজ নির্বাচন করুন এবং ঘরে বসেই রিয়েল ইনকাম শুরু করুন!
                    </p>
                  </div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
