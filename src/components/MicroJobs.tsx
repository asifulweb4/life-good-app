import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, DollarSign, CheckCircle2, ChevronRight, UploadCloud,
  Link as LinkIcon, FileText, AlertCircle, Play, Timer, HelpCircle,
  BookOpen, Calculator, Sparkles, Languages, Check, X
} from 'lucide-react';
import { Job } from '../types';

interface MicroJobsProps {
  jobs: Job[];
  onJobSuccess: (reward: number, jobTitle: string) => void;
  onUpdateJobs: (updatedJobs: Job[]) => void;
  userEmail?: string;
}

export default function MicroJobs({ jobs, onJobSuccess, onUpdateJobs, userEmail }: MicroJobsProps) {
  const [activeCategory, setActiveCategory] = useState<'social' | 'video' | 'math' | 'spelling' | 'article' | 'spin' | 'captcha' | 'typing'>('social');
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const [proofText, setProofText] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [loading, setLoading] = useState(false);

  const [videoTimer, setVideoTimer] = useState(0);
  const [isVideoWatching, setIsVideoWatching] = useState(false);
  const [watchedVideoId, setWatchedVideoId] = useState<string | null>(null);
  const [claimedVideoIds, setClaimedVideoIds] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('claimedVideoIds'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [articleTimer, setArticleTimer] = useState(0);
  const [isArticleReading, setIsArticleReading] = useState(false);
  const [readArticleId, setReadArticleId] = useState<string | null>(null);
  const [claimedArticleIds, setClaimedArticleIds] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('claimedArticleIds'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'+' | '-' | '*'>('+');
  const [mathUserAnswer, setMathUserAnswer] = useState('');
  const [mathChecked, setMathChecked] = useState(false);
  const [mathIsCorrect, setMathIsCorrect] = useState(false);
  const [mathStreak, setMathStreak] = useState(() => { try { return Number(localStorage.getItem('mathStreak') || '0'); } catch { return 0; } });
  const [mathLimit, setMathLimit] = useState(() => { try { return Number(localStorage.getItem('mathLimit') || '10'); } catch { return 10; } });

  const [spellingIndex, setSpellingIndex] = useState(0);
  const [selectedSpelling, setSelectedSpelling] = useState<string | null>(null);
  const [spellingChecked, setSpellingChecked] = useState(false);
  const [spellingIsCorrect, setSpellingIsCorrect] = useState(false);
  const [completedSpellingIds, setCompletedSpellingIds] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('completedSpellingIds'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const spellingQuizList = [
    { id: 'sp1', word: "নিচের কোন বানানটি ব্যাকরণগতভাবে সঠিক?", options: ["সমীচিন", "সমীচীন", "সমিচীন", "সমিচিন"], correct: "সমীচীন", reward: 2.50, meaning: "সঠিক বা যুক্তিযুক্ত" },
    { id: 'sp2', word: "নিচের কোনটি সঠিক বানান চিহ্নিত করুন?", options: ["বুদ্ধিজীবি", "বুদ্ধিজিবি", "বুদ্ধিজীবী", "বুদ্ধিজিবিী"], correct: "বুদ্ধিজীবী", reward: 2.00, meaning: "intellectual" },
    { id: 'sp3', word: "সঠিক বানানের বিকল্পটি বেছে নিন:", options: ["পিপীলিকা", "পিপিলিকা", "পীপিীলিকা", "পীপীলীকা"], correct: "পিপীলিকা", reward: 2.20, meaning: "পিঁপড়া" },
    { id: 'sp4', word: "কোন বানানটি শুদ্ধ বা হালাল?", options: ["শ্রদ্ধাঞ্জলী", "শ্রদ্ধাঞ্জলি", "সরদ্ধাঞ্জলি", "স্রদ্ধাঞ্জলী"], correct: "শ্রদ্ধাঞ্জলি", reward: 1.80, meaning: "সম্মান প্রদর্শনামূলক অর্ঘ্য" },
    { id: 'sp5', word: "নিচের কোনটি শুদ্ধ রূপ?", options: ["দারিদ্রতা", "দরিদ্রতা", "দারীদ্রতা", "দরিদ্রতাী"], correct: "দরিদ্রতা", reward: 2.50, meaning: "গরিব দশা বা অভাব" }
  ];

  const [spinLimit, setSpinLimit] = useState(() => { try { return Number(localStorage.getItem('spinLimit') || '5'); } catch { return 5; } });
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [spinDegrees, setSpinDegrees] = useState(0);

  const [captchaText, setCaptchaText] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaLimit, setCaptchaLimit] = useState(() => { try { return Number(localStorage.getItem('captchaLimit') || '20'); } catch { return 20; } });

  const [typingIndex, setTypingIndex] = useState(0);
  const [userTyping, setUserTyping] = useState('');
  const [typingLimit, setTypingLimit] = useState(() => { try { return Number(localStorage.getItem('typingLimit') || '5'); } catch { return 5; } });

  const typingTextsList = [
    { id: 'typ1', text: "সততাই সর্বোৎকৃষ্ট পন্থা। জীবনে সফল হতে চাইলে সততা ও কঠোর পরিশ্রমের কোনো বিকল্প নেই।", reward: 1.50 },
    { id: 'typ2', text: "সময়ের এক ফোঁড়, অসময়ের দশ ফোঁড়। তাই প্রতিটি মুহূর্তকে সঠিকভাবে কাজে লাগানো বুদ্ধিমানের কাজ।", reward: 1.20 },
    { id: 'typ3', text: "জ্ঞানার্জনের কোনো শেষ নেই। দোলনা থেকে কবর পর্যন্ত আমাদের নতুন কিছু শেখার আগ্রহ থাকা উচিত।", reward: 1.50 },
    { id: 'typ4', text: "অর্থ উপার্জনের চেয়ে সম্মান অর্জন করা বেশি কঠিন এবং মূল্যবান। হালাল উপার্জনে বরকত রয়েছে।", reward: 1.80 }
  ];

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserCaptcha('');
  };

  useEffect(() => {
    if (activeCategory === 'captcha' && !captchaText) {
      generateCaptcha();
    }
  }, [activeCategory]);

  useEffect(() => {
    try {
      localStorage.setItem('spinLimit', spinLimit.toString());
      localStorage.setItem('captchaLimit', captchaLimit.toString());
      localStorage.setItem('typingLimit', typingLimit.toString());
    } catch { }
  }, [spinLimit, captchaLimit, typingLimit]);

  const videosList = [
    { id: 'vid1', title: "হালাল উপায়ে মোবাইল দিয়ে ফ্রিল্যান্সিং করার গোপন ট্রিকস", reward: 2.00, embedId: "8I_asT6wTsc", desc: "১৫ সেকেন্ড ভিডিওটি মনোযোগ দিয়ে দেখুন এবং আপনার ব্যালান্স নিশ্চিত করুন।" },
    { id: 'vid2', title: "লাইফ গুড রিসেলিং পণ্য বিক্রি করার সঠিক টেকনিক গাইড", reward: 2.50, embedId: "S_vO_0C5Wsc", desc: "পূর্ণ গাইডলাইন বুঝে নিতে ১৫ সেকেন্ড ভিডিও সেশনটি দেখুন।" },
    { id: 'vid3', title: "সোশ্যাল মিডিয়া ফেসবুক বা ইউটিউবে ট্রাফিক বৃদ্ধির সিক্রেট", reward: 2.20, embedId: "L1vS_iO2aDo", desc: "বড় টিম গড়ে তোলার জন্য ১৫ সেকেন্ড ভিডিও টিউটোরিয়াল সেশনটি ওয়াচ করুন।" }
  ];

  const articlesList = [
    { id: 'art1', title: "অনলাইন থেকে ইনকাম করার ৫টি সহজ উপায় জানুন", reward: 1.50, url: "https://google.com", desc: "আর্টিকেলটি ওপেন করুন এবং ৩০ সেকেন্ড স্ক্রল করে পড়ুন।" },
    { id: 'art2', title: "ডিজিটাল মার্কেটিং কেন শিখবেন এবং এর ভবিষ্যৎ কি?", reward: 1.20, url: "https://google.com", desc: "আর্টিকেলটি ওপেন করে ৩০ সেকেন্ড অপেক্ষা করুন এবং ফিরে আসুন।" },
    { id: 'art3', title: "ইউটিউব থেকে দ্রুত ইনকাম করার কার্যকরী গোপন ট্রিকস", reward: 2.00, url: "https://google.com", desc: "লিংকে গিয়ে আর্টিকেলটি ৩০ সেকেন্ড মনোযোগ সহকারে পড়ুন।" }
  ];

  useEffect(() => {
    try { localStorage.setItem('claimedVideoIds', JSON.stringify(claimedVideoIds)); } catch { }
  }, [claimedVideoIds]);

  useEffect(() => {
    try { localStorage.setItem('claimedArticleIds', JSON.stringify(claimedArticleIds)); } catch { }
  }, [claimedArticleIds]);

  useEffect(() => {
    try { localStorage.setItem('completedSpellingIds', JSON.stringify(completedSpellingIds)); } catch { }
  }, [completedSpellingIds]);

  useEffect(() => {
    try {
      localStorage.setItem('mathStreak', mathStreak.toString());
      localStorage.setItem('mathLimit', mathLimit.toString());
    } catch { }
  }, [mathStreak, mathLimit]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVideoWatching && videoTimer > 0) {
      interval = setInterval(() => setVideoTimer((prev) => prev - 1), 1000);
    } else if (videoTimer === 0 && isVideoWatching) {
      setIsVideoWatching(false);
    }
    return () => clearInterval(interval);
  }, [isVideoWatching, videoTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isArticleReading && articleTimer > 0) {
      interval = setInterval(() => setArticleTimer((prev) => prev - 1), 1000);
    } else if (articleTimer === 0 && isArticleReading) {
      setIsArticleReading(false);
    }
    return () => clearInterval(interval);
  }, [isArticleReading, articleTimer]);

  const selectJob = (job: Job) => {
    setActiveJob(job);
    setProofText('');
    setProofFile(null);
    setFileName('');
    setSubmissionSuccess(false);
    setSubmissionError('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
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
        body: JSON.stringify({ email, jobId: activeJob.id, reward: activeJob.reward, title: activeJob.title })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'প্রমাণ সাবমিট করা যায়নি।');
      onJobSuccess(activeJob.reward, activeJob.title);
      const updated = jobs.map((j) => j.id === activeJob.id ? { ...j, isCompleted: true, completedCount: j.completedCount + 1 } : j);
      onUpdateJobs(updated);
      setSubmissionSuccess(true);
      setSubmissionError('');
    } catch (err: any) {
      setSubmissionError(err.message || 'একটি নেটওয়ার্ক সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const startWatchingVideo = (id: string) => {
    setWatchedVideoId(id);
    setVideoTimer(15);
    setIsVideoWatching(true);
  };

  const claimVideoIncome = async (id: string, reward: number, title: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = user.email || userEmail || 'guest@lifegood.com';
      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobId: id, reward, title: `লানিং ভিডিও ওয়াচ: ${title}` })
      });
      const data = await response.json();
      if (response.ok) {
        setClaimedVideoIds((prev) => [...prev, id]);
        onJobSuccess(reward, `ভিডিও ওয়াচ: ${title}`);
        alert(`🎉 অভিনন্দন! ভিডিও ওয়াচ ক্লেইম সফল হয়েছে। আপনার ওয়ালেটে ${reward} ৳ যোগ করা হয়েছে।`);
      } else {
        alert(data.error || 'ইতিপূর্বে ক্লেইম করেছেন!');
      }
    } catch (e) { console.error(e); }
  };

  const handleSpinWheel = async () => {
    if (spinLimit <= 0 || isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    const randomExtraDegrees = Math.floor(Math.random() * 360);
    const newDegrees = spinDegrees + 1440 + randomExtraDegrees;
    setSpinDegrees(newDegrees);
    setTimeout(async () => {
      setIsSpinning(false);
      const reward = Number((Math.random() * 4.5 + 0.5).toFixed(2));
      setSpinResult(reward);
      setSpinLimit(prev => prev - 1);
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';
        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, jobId: `spin_${Date.now()}`, reward, title: `লাকি স্পিন উইন: ${reward} ৳` })
        });
        onJobSuccess(reward, `লাকি স্পিন উইন`);
      } catch (err) { console.error(err); }
    }, 3000);
  };

  const handleVerifyCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaLimit <= 0) return;
    if (userCaptcha === captchaText) {
      const reward = 0.50;
      setCaptchaLimit(prev => prev - 1);
      generateCaptcha();
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';
        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, jobId: `captcha_${Date.now()}`, reward, title: `ক্যাপচা টাইপিং সম্পূর্ণ` })
        });
        onJobSuccess(reward, `ক্যাপচা টাইপিং`);
      } catch (err) { console.error(err); }
    } else {
      alert('ভুল ক্যাপচা! আবার চেষ্টা করুন।');
      generateCaptcha();
    }
  };

  const handleVerifyTyping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typingLimit <= 0) return;
    const currentTypingTask = typingTextsList[typingIndex];
    if (userTyping.trim() === currentTypingTask.text.trim()) {
      const reward = currentTypingTask.reward;
      setTypingLimit(prev => prev - 1);
      setUserTyping('');
      setTypingIndex(prev => (prev + 1) % typingTextsList.length);
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';
        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, jobId: `typing_${Date.now()}`, reward, title: `ডেটা এন্ট্রি (টাইপিং)` })
        });
        onJobSuccess(reward, `ডেটা এন্ট্রি (টাইপিং)`);
      } catch (err) { console.error(err); }
    } else {
      alert('⚠️ টেক্সট সম্পূর্ণ মিলেনি! দয়া করে হুবহু উপরের টেক্সটটি টাইপ করুন (দাড়ি, কমা সহ)।');
    }
  };

  const startReadingArticle = (id: string, url: string) => {
    window.open(url, '_blank');
    setReadArticleId(id);
    setArticleTimer(30);
    setIsArticleReading(true);
  };

  const claimArticleIncome = async (id: string, reward: number, title: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const email = user.email || userEmail || 'guest@lifegood.com';
      const response = await fetch('/api/complete-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobId: id, reward, title: `আর্টিকেল রিডিং: ${title}` })
      });
      const data = await response.json();
      if (response.ok) {
        setClaimedArticleIds((prev) => [...prev, id]);
        onJobSuccess(reward, `আর্টিকেল রিডিং: ${title}`);
        alert(`🎉 অভিনন্দন! আর্টিকেল পড়া সম্পন্ন হয়েছে। আপনার ওয়ালেটে ${reward} ৳ যোগ করা হয়েছে।`);
      } else {
        alert(data.error || 'ইতিপূর্বে ক্লেইম করেছেন!');
      }
    } catch (e) { console.error(e); }
  };

  const generateNewMathQuestion = () => {
    const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const selectedOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = 0, n2 = 0;
    if (selectedOp === '+') { n1 = Math.floor(Math.random() * 80) + 10; n2 = Math.floor(Math.random() * 80) + 10; }
    else if (selectedOp === '-') { n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * (n1 - 5)) + 4; }
    else { n1 = Math.floor(Math.random() * 9) + 2; n2 = Math.floor(Math.random() * 9) + 2; }
    setMathNum1(n1); setMathNum2(n2); setMathOp(selectedOp);
    setMathUserAnswer(''); setMathChecked(false); setMathIsCorrect(false);
  };

  useEffect(() => { generateNewMathQuestion(); }, []);

  const handleVerifyMath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mathLimit <= 0) { alert('⚠️ আজ আপনার অংক করার দৈনিক সীমা শেষ হয়েছে! আগামীকাল আবার চেষ্টা করুন।'); return; }
    let correctAnswer = mathOp === '+' ? mathNum1 + mathNum2 : mathOp === '-' ? mathNum1 - mathNum2 : mathNum1 * mathNum2;
    const parsedUserAnswer = parseInt(mathUserAnswer.trim(), 10);
    setMathChecked(true);
    if (parsedUserAnswer === correctAnswer) {
      setMathIsCorrect(true);
      setMathStreak((prev) => prev + 1);
      setMathLimit((prev) => prev - 1);
      const reward = 2.00;
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const email = user.email || userEmail || 'guest@lifegood.com';
        await fetch('/api/complete-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, jobId: `math_solve_${Date.now()}`, reward, title: `গণিত সমাধান সম্পূর্ণ (ক্লেইমড)` })
        });
        onJobSuccess(reward, `অংক সমাধান টাস্ক: ${mathNum1} ${mathOp} ${mathNum2} = ${correctAnswer}`);
      } catch (err) { console.error(err); }
    } else {
      setMathIsCorrect(false);
      setMathStreak(0);
    }
  };

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
          body: JSON.stringify({ email, jobId: `spell_quiz_${quiz.id}`, reward, title: `বানান শুদ্ধিকরণ কুইজ: ${quiz.correct}` })
        });
        setCompletedSpellingIds((prev) => [...prev, quiz.id]);
        onJobSuccess(reward, `বানান শুদ্ধিকরণ: ${quiz.correct}`);
      } catch (err) { console.error(err); }
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

  // Tab config — all 8 tabs
  const tabs = [
    { id: 'social', label: `সামাজিক কাজ (${jobs.length})`, icon: <Briefcase size={13} /> },
    { id: 'video', label: 'ভিডিও দেখুন', icon: <Play size={13} /> },
    { id: 'math', label: 'অংক করুন', icon: <Calculator size={13} /> },
    { id: 'spelling', label: 'বানান শুদ্ধিকরণ', icon: <Languages size={13} /> },
    { id: 'article', label: 'ওয়েবসাইট ভিজিট', icon: <BookOpen size={13} /> },
    { id: 'spin', label: 'লাকি স্পিন', icon: <Sparkles size={13} /> },
    { id: 'captcha', label: 'ক্যাপচা টাইপিং', icon: <FileText size={13} /> },
    { id: 'typing', label: 'ডেটা এন্ট্রি', icon: <BookOpen size={13} /> },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6" id="micro-jobs">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">রিয়েল ইনকাম মাইক্রো টাস্ক</h1>
            <p className="text-xs sm:text-sm opacity-95">
              হালাল উপায়ে ভিডিও দেখে, গণিত সমাধান করে কিংবা সহীহ বাংলা বানান নির্ণয় করে আপনার দৈনন্দিন নিশ্চিত আয়ের পরিধি বাড়ান!
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl min-w-36 text-center border border-white/20">
            <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-widest block">টাস্ক পেমেন্ট</span>
            <p className="text-2xl font-black mt-1 text-white">ইনস্ট্যান্ট বিকাশ</p>
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Category Tabs — flex-wrap so all 8 tabs always visible */}
      <div className="flex flex-wrap gap-2 p-2 bg-purple-50 rounded-2xl border border-purple-100/40" id="category-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${activeCategory === tab.id
                ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md'
                : 'text-purple-600 hover:bg-purple-100/50'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 space-y-4">

          {/* TAB 1: SOCIAL JOBS */}
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
                  >
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">{job.category}</span>
                        {job.isCompleted && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> সম্পূর্ণ
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-purple-950 text-xs sm:text-sm leading-snug line-clamp-2">{job.title}</h4>
                      <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(job.completedCount / job.subscribersNeeded) * 100}%` }}></div>
                      </div>
                      <p className="text-[9px] text-gray-400 font-medium">অগ্রগতি: {job.completedCount}/{job.subscribersNeeded} সম্পূর্ণ</p>
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

          {/* TAB 2: VIDEO */}
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
                        <span className="text-[9px] font-black tracking-wider px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full uppercase">Video Course Task</span>
                        <h4 className="font-bold text-purple-950 text-xs sm:text-sm">{video.title}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{video.desc}</p>
                      </div>
                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 text-right shrink-0">
                        <span className="text-pink-600 font-black text-sm font-mono block">+{video.reward.toFixed(2)} ৳</span>
                        {isClaimed ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">কমপ্লিট</span>
                        ) : isWatchingThis && videoTimer > 0 ? (
                          <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-xl font-bold">
                            <Timer size={12} className="animate-spin text-amber-600" /><span>{videoTimer} সেকেন্ড...</span>
                          </div>
                        ) : isWatchingThis && videoTimer === 0 ? (
                          <button onClick={() => claimVideoIncome(video.id, video.reward, video.title)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md">টাকা ক্লেইম করুন ৳</button>
                        ) : (
                          <button onClick={() => startWatchingVideo(video.id)} className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer">
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

          {/* TAB: ARTICLE */}
          {activeCategory === 'article' && (
            <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
              <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 border-b border-purple-50 pb-2">
                <BookOpen size={16} className="text-pink-500" /> আর্টিকেল পড়ুন ও আয় করুন ({articlesList.length})
              </h3>
              <div className="space-y-4">
                {articlesList.map((article) => {
                  const isClaimed = claimedArticleIds.includes(article.id);
                  const isReadingThis = readArticleId === article.id;
                  return (
                    <div key={article.id} className="p-4 bg-purple-50/20 border border-purple-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black tracking-wider px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full uppercase">Website Task</span>
                        <h4 className="font-bold text-purple-950 text-xs sm:text-sm">{article.title}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{article.desc}</p>
                      </div>
                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 text-right shrink-0">
                        <span className="text-pink-600 font-black text-sm font-mono block">+{article.reward.toFixed(2)} ৳</span>
                        {isClaimed ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">কমপ্লিট</span>
                        ) : isReadingThis && articleTimer > 0 ? (
                          <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 rounded-xl font-bold">
                            <Timer size={12} className="animate-spin text-amber-600" /><span>{articleTimer} সেকেন্ড...</span>
                          </div>
                        ) : isReadingThis && articleTimer === 0 ? (
                          <button onClick={() => claimArticleIncome(article.id, article.reward, article.title)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer shadow-md">টাকা ক্লেইম করুন ৳</button>
                        ) : (
                          <button onClick={() => startReadingArticle(article.id, article.url)} className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer">
                            <LinkIcon size={10} /> ভিজিট করুন
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SPIN */}
          {activeCategory === 'spin' && (
            <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 text-center">
              <h3 className="font-extrabold text-purple-950 text-base flex items-center justify-center gap-1.5 border-b border-purple-50 pb-2 mb-6">
                <Sparkles size={16} className="text-yellow-500" /> লাকি স্পিন ও উইন
              </h3>
              <div className="mb-4">
                <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-bold border border-pink-100">আজকের স্পিন বাকি: {spinLimit}</span>
              </div>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div
                  className="w-full h-full rounded-full border-8 border-purple-200 shadow-xl overflow-hidden relative transition-transform duration-[3000ms] ease-out"
                  style={{ transform: `rotate(${spinDegrees}deg)`, background: 'conic-gradient(#fdf4ff 0deg, #f3e8ff 90deg, #fce7f3 180deg, #fae8ff 270deg, #fdf4ff 360deg)' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={40} className="text-purple-300 opacity-50" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-purple-100"></div>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-purple-100"></div>
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-pink-500 z-10 drop-shadow-md"></div>
              </div>
              <AnimatePresence>
                {spinResult !== null && !isSpinning && (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4">
                    <p className="text-lg font-black text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-200">🎉 আপনি জিতেছেন: {spinResult} ৳</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || spinLimit <= 0}
                className={`px-8 py-3 rounded-full font-black text-white text-lg transition-all shadow-lg w-full max-w-xs ${isSpinning || spinLimit <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 cursor-pointer shadow-pink-200'}`}
              >
                {isSpinning ? 'স্পিন হচ্ছে...' : spinLimit <= 0 ? 'আজকের লিমিট শেষ' : 'স্পিন করুন'}
              </button>
            </div>
          )}

          {/* TAB: CAPTCHA ✅ */}
          {activeCategory === 'captcha' && (
            <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
              <div className="flex justify-between items-center border-b border-purple-50 pb-2">
                <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5">
                  <FileText size={16} className="text-purple-600" /> ক্যাপচা এন্ট্রি
                </h3>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">আজ বাকি: {captchaLimit}</span>
              </div>
              {captchaLimit <= 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-500">আজকের ক্যাপচা লিমিট শেষ হয়েছে।<br />আগামীকাল আবার চেষ্টা করুন।</p>
                </div>
              ) : (
                <div className="bg-gradient-to-b from-purple-50/40 to-white border border-purple-100 rounded-2xl p-5 text-center">
                  <p className="text-xs text-purple-700 font-semibold mb-4">নিচের টেক্সটটি বক্সে সঠিকভাবে লিখুন এবং ০.৫০ ৳ আয় করুন।</p>
                  <div className="bg-gray-800 rounded-xl p-4 mb-5 select-none relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #fff 10px, #fff 20px)' }}></div>
                    <span className="relative z-10 text-3xl font-mono font-black tracking-widest text-white drop-shadow-md line-through decoration-gray-500">{captchaText}</span>
                  </div>
                  <form onSubmit={handleVerifyCaptcha} className="max-w-xs mx-auto space-y-3">
                    <input
                      type="text"
                      required
                      value={userCaptcha}
                      onChange={(e) => setUserCaptcha(e.target.value)}
                      placeholder="উপরে লেখা ক্যাপচাটি টাইপ করুন"
                      className="w-full text-center text-sm font-bold font-mono bg-white border-2 border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={userCaptcha.length < 5}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-40"
                    >
                      সাবমিট করুন
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: TYPING ✅ */}
          {activeCategory === 'typing' && (
            <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
              <div className="flex justify-between items-center border-b border-purple-50 pb-2">
                <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5">
                  <BookOpen size={16} className="text-pink-500" /> ডেটা এন্ট্রি কাজ
                </h3>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">আজ বাকি: {typingLimit}</span>
              </div>
              {typingLimit <= 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm font-bold text-gray-500">আজকের টাইপিং লিমিট শেষ হয়েছে।<br />আগামীকাল আবার চেষ্টা করুন।</p>
                </div>
              ) : (
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5">
                  <p className="text-xs text-purple-700 font-semibold mb-4 text-center">
                    নিচের টেক্সটটি হুবহু কপি না করে টাইপ করুন এবং {typingTextsList[typingIndex].reward.toFixed(2)} ৳ আয় করুন।
                  </p>
                  <div className="bg-white border border-purple-200 rounded-xl p-4 mb-5 select-none shadow-sm relative">
                    <span className="absolute -top-3 -right-2 bg-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                      +{typingTextsList[typingIndex].reward.toFixed(2)} ৳
                    </span>
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">{typingTextsList[typingIndex].text}</p>
                  </div>
                  <form onSubmit={handleVerifyTyping} className="space-y-3">
                    <textarea
                      required
                      value={userTyping}
                      onChange={(e) => setUserTyping(e.target.value)}
                      rows={3}
                      placeholder="উপরে লেখা বাক্যটি হুবহু এখানে টাইপ করুন (দাড়ি, কমা সহ)..."
                      className="w-full text-sm font-medium bg-white border-2 border-purple-100 focus:border-pink-300 rounded-xl py-3 px-4 text-purple-950 focus:outline-none resize-none"
                      onPaste={(e) => { e.preventDefault(); alert('কপি-পেস্ট করা নিষেধ! দয়া করে নিজে টাইপ করুন।'); }}
                    />
                    <button
                      type="submit"
                      disabled={userTyping.length < 10}
                      className="w-full py-3 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-sm rounded-xl shadow cursor-pointer disabled:opacity-40"
                    >
                      সাবমিট করুন
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: MATH */}
          {activeCategory === 'math' && (
            <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
              <div className="flex justify-between items-center border-b border-purple-50 pb-2 select-none">
                <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5">
                  <Calculator size={16} className="text-purple-600" /> গণিত সমাধান এরিনা
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-100/40 px-2 py-0.5 rounded-full">আজ বাকি: {mathLimit} বার</span>
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-50 border border-pink-100 py-0.5 px-2 rounded-full">টানা স্কোর: {mathStreak} 🔥</span>
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
                    className="w-full text-center text-lg font-bold font-mono bg-white border-2 border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none placeholder:text-gray-300"
                  />
                  <AnimatePresence mode="wait">
                    {mathChecked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${mathIsCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                      >
                        {mathIsCorrect ? (
                          <><CheckCircle2 size={14} className="text-emerald-600" /><span>আহ্লাদ! সঠিক উত্তর দিয়ে +২.০০ ৳ লাভ করেছেন!</span></>
                        ) : (
                          <><AlertCircle size={14} className="text-red-500" /><span>ভুল উত্তর। সঠিক ছিল: {mathOp === '+' ? mathNum1 + mathNum2 : mathOp === '-' ? mathNum1 - mathNum2 : mathNum1 * mathNum2}</span></>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-2.5">
                    {mathChecked && (
                      <button type="button" onClick={generateNewMathQuestion} className="flex-1 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl cursor-pointer border border-purple-200">নতুন অংক</button>
                    )}
                    <button type="submit" disabled={mathUserAnswer === '' || (mathChecked && mathIsCorrect)} className="flex-[2] py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer disabled:opacity-40">উত্তর জমা দিন</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB: SPELLING */}
          {activeCategory === 'spelling' && (
            <div className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
              <h3 className="font-extrabold text-purple-950 text-base flex items-center gap-1.5 border-b border-purple-50 pb-2 select-none">
                <Languages size={16} className="text-pink-500" /> বানান শুদ্ধিকরণ কুইজ
              </h3>
              {(() => {
                const quiz = spellingQuizList[spellingIndex];
                return (
                  <div key={quiz.id} className="space-y-4">
                    <div className="flex justify-between items-center bg-purple-50/40 p-3 rounded-2xl border border-purple-100/60 select-none">
                      <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2.5 py-1 rounded-full uppercase">প্রশ্ন {spellingIndex + 1}/{spellingQuizList.length}</span>
                      <span className="text-pink-600 font-extrabold text-xs font-mono">পুরস্কার: +{quiz.reward.toFixed(2)} ৳</span>
                    </div>
                    <h4 className="font-extrabold text-purple-950 text-sm py-2 leading-relaxed">{quiz.word}</h4>
                    <div className="grid grid-cols-2 gap-3.5">
                      {quiz.options.map((opt) => {
                        const isSelected = selectedSpelling === opt;
                        const isCorrectOpt = quiz.correct === opt;
                        let cardStyle = "border-purple-100/60 bg-white text-purple-900 hover:bg-purple-50/30";
                        if (spellingChecked) {
                          if (isCorrectOpt) cardStyle = "border-emerald-300 bg-emerald-50 text-emerald-800";
                          else if (isSelected && !isCorrectOpt) cardStyle = "border-red-300 bg-red-50 text-red-700";
                          else cardStyle = "border-purple-50 bg-gray-50/40 opacity-55 text-gray-400";
                        } else if (isSelected) cardStyle = "border-purple-600 bg-purple-50 text-purple-950";
                        return (
                          <button key={opt} disabled={spellingChecked} onClick={() => verifySpellingChoice(opt)} className={`p-3 text-center text-xs font-bold rounded-2xl border cursor-pointer transition-all ${cardStyle}`}>
                            {opt}
                            {spellingChecked && isCorrectOpt && <span className="inline-block ml-1 text-emerald-600">✓</span>}
                            {spellingChecked && isSelected && !isCorrectOpt && <span className="inline-block ml-1 text-red-500">✗</span>}
                          </button>
                        );
                      })}
                    </div>
                    {spellingChecked && (
                      <div className="p-3 bg-purple-50/60 rounded-xl text-xs border border-purple-100/40 text-purple-950 font-semibold leading-relaxed">
                        🔍 বানানের অর্থ: <span className="text-gray-600 font-medium">{quiz.meaning}</span>
                      </div>
                    )}
                    <AnimatePresence mode="wait">
                      {spellingChecked && (
                        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-xl text-xs font-bold text-center ${spellingIsCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          {spellingIsCorrect ? 'অভিনন্দন! সঠিক বানান নির্বাচন করে আপনি পুরস্কৃত হয়েছেন! 🎉' : 'উফস! আপনার উত্তরটি ভুল। পরবর্তী কুইজে চলে যান।'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={nextSpellingQuiz} className="w-full py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs rounded-xl cursor-pointer text-center border border-purple-200/50">পরবর্তী কুইজ দেখুন</button>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="md:col-span-5">
          <AnimatePresence mode="wait">
            {activeCategory === 'social' && activeJob ? (
              <motion.div key={activeJob.id} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-5 shadow-xl shadow-purple-50/50 space-y-4">
                <div className="flex justify-between items-start gap-4 select-none">
                  <div>
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase">{activeJob.category} টাস্ক</span>
                    <h3 className="font-extrabold text-purple-950 text-sm sm:text-base mb-1 leading-snug tracking-tight mt-1">{activeJob.title}</h3>
                  </div>
                  <p className="font-black text-pink-600 text-lg font-mono shrink-0">+{Number(activeJob.reward).toFixed(2)} ৳</p>
                </div>
                <p className="text-xs text-purple-600 bg-purple-50 p-3 rounded-xl border border-purple-100/50 leading-relaxed font-semibold">
                  📋 কাজের নির্দেশনা:<br /><span className="text-gray-600 font-medium mt-1 inline-block">{activeJob.description}</span>
                </p>
                {activeJob.url && (
                  <a href={activeJob.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2 px-4 border border-purple-100 hover:border-purple-200 bg-purple-50/40 hover:bg-purple-50 text-purple-700 font-extrabold text-xs rounded-xl transition-all">
                    <LinkIcon size={14} /> কাজের লিংকটি ওপেন করুন
                  </a>
                )}
                {submissionSuccess ? (
                  <div className="text-center py-5 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-100 p-4 select-none">
                    <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-emerald-800 text-sm">প্রমাণ সফলভাবে জমা হয়েছে!</h4>
                      <p className="text-[10px] text-purple-800">আপনার একাউন্ট ব্যালান্সে <strong>{activeJob.reward} ৳</strong> যোগ করা হয়েছে।</p>
                    </div>
                  </div>
                ) : activeJob.isCompleted ? (
                  <div className="text-center py-5 bg-emerald-50 rounded-2xl border border-emerald-100 p-4 select-none">
                    <CheckCircle2 className="mx-auto text-emerald-600 mb-2" size={32} />
                    <h4 className="font-bold text-emerald-800 text-sm">আপনি ইতিপূর্বে কাজটি সম্পন্ন করেছেন!</h4>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProof} className="space-y-4 pt-1">
                    <h4 className="text-xs font-extrabold text-purple-950 uppercase border-b border-purple-50 pb-1 select-none">কাজের প্রমাণ সাবমিট করুন</h4>
                    <div
                      onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-28 gap-2 ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/10'}`}
                    >
                      <input type="file" id="proof-image-upload" onChange={handleFileChange} accept="image/*" className="hidden" />
                      <label htmlFor="proof-image-upload" className="cursor-pointer flex flex-col items-center gap-1 select-none">
                        <UploadCloud size={24} className="text-purple-400" />
                        <span className="text-[11px] font-bold text-purple-900 leading-tight">{fileName ? 'চেঞ্জ করুন' : 'প্রমাণ স্ক্রিনশট আপলোড দিন'}</span>
                        <span className="text-[9px] text-gray-400 font-medium">ড্র্যাগ অ্যান্ড ড্রপ অথবা ক্লিক করুন</span>
                      </label>
                      {fileName && <div className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] font-bold py-1 px-2.5 rounded-full select-none"><FileText size={10} /><span className="line-clamp-1 max-w-32">{fileName}</span></div>}
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-purple-950 block mb-1 select-none">প্রমাণস্বরূপ লেখা বা লিংক (ঐচ্ছিক)</label>
                      <input type="text" value={proofText} onChange={(e) => setProofText(e.target.value)} placeholder="ইউটিউব নাম, ইমেইল বা ফেসবুক লিংক দিন" className="w-full text-xs bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 px-3 text-purple-950 focus:outline-none" />
                    </div>
                    {submissionError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1 select-none">
                        <AlertCircle size={14} className="shrink-0" /><span>{submissionError}</span>
                      </div>
                    )}
                    <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md cursor-pointer">
                      {loading ? 'ভেরিফাই হচ্ছে...' : 'ভেরিফাই এবং সাবমিট প্রুফ'}
                    </button>
                  </form>
                )}
              </motion.div>
            ) : watchedVideoId ? (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/95 backdrop-blur rounded-3xl border border-purple-100 p-4 shadow-xl shadow-purple-50/50 space-y-4">
                <div className="text-xs font-extrabold text-purple-900 bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200/45 flex items-center gap-1 select-none">
                  <Play size={14} className="text-pink-500 animate-pulse" /><span>সক্রিয় ভিডিও প্লেয়ার সেশন</span>
                </div>
                <div className="rounded-2xl overflow-hidden aspect-video bg-purple-950 border border-purple-100 shadow-md">
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videosList.find((v) => v.id === watchedVideoId)?.embedId}?autoplay=1`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100/60 text-center select-none">
                  <h4 className="font-extrabold text-purple-950 text-xs sm:text-sm leading-snug line-clamp-2">{videosList.find((v) => v.id === watchedVideoId)?.title}</h4>
                  {videoTimer > 0 ? (
                    <div className="mt-2 text-xs font-bold text-purple-700 flex items-center justify-center gap-1">
                      <Timer size={12} className="animate-spin text-purple-600" /><span>আরও {videoTimer} সেকেন্ড দেখুন।</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs font-black text-emerald-700 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-600 animate-bounce" /><span>ভিডিও দেখা শেষ! ক্লেইম করুন।</span>
                    </div>
                  )}
                </div>
                {videoTimer === 0 && (
                  <button onClick={() => { const vObj = videosList.find((v) => v.id === watchedVideoId); if (vObj) claimVideoIncome(vObj.id, vObj.reward, vObj.title); }} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer text-center shadow-lg shadow-emerald-50">
                    ৳ {videosList.find((v) => v.id === watchedVideoId)?.reward.toFixed(2)} ইনকাম ক্লেইম করুন!
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="bg-white/80 border border-purple-100 rounded-3xl p-8 text-center shadow-xl shadow-purple-50/50 max-w-xs mx-auto select-none">
                <Briefcase size={36} className="mx-auto text-purple-300 mb-2.5 animate-bounce" style={{ animationDuration: '4s' }} />
                <h4 className="font-extrabold text-purple-950 text-sm mb-1">কাজটি নির্বাচন করুন</h4>
                <p className="text-xs text-purple-500 leading-relaxed font-semibold">বামদিকের টাস্ক তালিকা বা স্পেশাল ট্যাব থেকে যেকোনো একটি কাজ নির্বাচন করুন এবং ঘরে বসেই রিয়েল ইনকাম শুরু করুন!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}