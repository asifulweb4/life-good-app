/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Job, TrainingSection, DriveOffer } from './types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: "প্রিমিয়াম হাফ হাতা পলো শার্ট",
    code: "LG-88836",
    wholesalePrice: 410,
    regularPrice: 710,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
    category: "t-shirt",
    description: "আরামদায়ক সফট ফেব্রিক ও আকর্ষণীয় ডিজাইনের আকর্ষণীয় পলো শার্ট। জিম, স্পোর্টস বা সাধারণ পরার জন্য উপযোগী।"
  },
  {
    id: 'p2',
    name: "ডিজিটাল প্রিন্ট আধুনিক পাঞ্জাবি",
    code: "LG-10252",
    wholesalePrice: 620,
    regularPrice: 1100,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop",
    category: "panjabi",
    description: "বিলাসবহুল কটন ফেব্রিক দিয়ে তৈরি ডিজিটাল প্রিন্টেড গর্জিয়াস পাঞ্জাবি। উৎসব বা অনুষ্ঠানের জন্য দারুণ।"
  },
  {
    id: 'p3',
    name: "ক্লাসিক ক্যাজুয়াল মেনস শার্ট",
    code: "LG-33827",
    wholesalePrice: 400,
    regularPrice: 650,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    category: "shirts",
    description: "১০০% সুতি প্রিমিয়াম ক্যাজুয়াল শার্ট। ফর্মাল অথবা সেমি-ফর্মাল গেটআপের সাথে অনায়াসে মানাবে।"
  },
  {
    id: 'p4',
    name: "স্টাইলিশ গাবারডিন স্ট্রেইট প্যান্ট",
    code: "LG-20391",
    wholesalePrice: 530,
    regularPrice: 850,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
    category: "pants",
    description: "নমনীয় গাবারডিন ফ্যাব্রিক সমৃদ্ধ ফিটিং প্যান্ট। প্রতিদিন ব্যবহারের জন্য দীর্ঘস্থায়ী এবং মানানসই।"
  },
  {
    id: 'p5',
    name: "গর্জিয়াস থ্রি পিস সালোয়ার কামিজ",
    code: "LG-66029",
    wholesalePrice: 640,
    regularPrice: 1250,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
    category: "three piece",
    description: "মানসম্পন্ন জর্জেট এবং এমব্রয়ডারি ওয়ার্ক কৃত আকর্ষণীয় ডিজাইনের থ্রি-পিস কালেকশন।"
  },
  {
    id: 'p6',
    name: "ডিজাইনড কলার ট্রাভেল শার্ট",
    code: "LG-77182",
    wholesalePrice: 460,
    regularPrice: 750,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop",
    category: "shirts",
    description: "আরামদায়ক ট্রাভেলিং শার্ট। হালকা ওজনের উন্নত ফ্যাব্রিক, গরমে আরামের জন্য সেরা সঙ্গী।"
  },
  {
    id: 'p7',
    name: "ডিজিটাল মার্কেটিং ও গ্রাফিক্স ডিজাইন মেগা কোর্স বান্ডেল (অ্যাফিলিয়েট)",
    code: "LG-SKILL-99",
    wholesalePrice: 150,
    regularPrice: 500,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
    category: "Digital Product",
    description: "এটি একটি ডিজিটাল প্রোডাক্ট। আপনি মাত্র ১৫০ টাকায় আমাদের থেকে অ্যাক্সেস নিয়ে কাস্টমারের কাছে ৫০০ টাকায় বিক্রি করতে পারবেন। বাকি ৩৫০ টাকা সম্পূর্ণ আপনার প্রফিট!"
  }
];

export const mockJobs: Job[] = [
  {
    id: 'j1',
    title: "লাইভ গুড অফিসিয়াল ইউটিউব চ্যানেল সাবস্ক্রাইব করুন",
    reward: 1.5,
    category: "YouTube",
    url: "https://youtube.com",
    description: "দেওয়া লিংকে গিয়ে অফিসিয়াল চ্যানেলটি সাবস্ক্রাইব করুন এবং বেল আইকন চালু করুন। স্ক্রিনশট আপলোড করে প্রুফ বা প্রমাণ সাবমিট করুন।",
    subscribersNeeded: 1000,
    completedCount: 654
  },
  {
    id: 'j2',
    title: "ফেসবুক অফিসিয়াল গ্রুপ জয়েন করুন",
    reward: 1.0,
    category: "Facebook",
    url: "https://facebook.com",
    description: "আমাদের ফেসবুক গ্রুপে জয়েন করুন। জয়েন করার পরে গ্রুপের নাম ও স্ক্রিনশট আপলোড করুন।",
    subscribersNeeded: 5000,
    completedCount: 4210
  },
  {
    id: 'j3',
    title: "নিউজ সাইট পোস্ট শেয়ার করুন এবং মন্তব্য করুন",
    reward: 2.0,
    category: "Website",
    url: "https://news.google.com",
    description: "দেওয়া নিউজ সাইটের যেকোনো একটি পোস্টে একটি পজিটিভ কমেন্ট করুন এবং আপনার ফেসবুক ওয়ালে পাবলিক শেয়ার করে স্ক্রিনশট বা প্রোফাইল লিংক দিন।",
    subscribersNeeded: 500,
    completedCount: 312
  },
  {
    id: 'j4',
    title: "অফিসিয়াল ভিডিওতে লাইক ও শেয়ার দিন",
    reward: 0.5,
    category: "YouTube",
    url: "https://youtube.com/shorts",
    description: "ইউটিউব শর্টস ভিডিওটিতে লাইক ও কমেন্ট করুন এবং আপনার ফেসবুকে শেয়ার করুন।",
    subscribersNeeded: 2000,
    completedCount: 1540
  },
  {
    id: 'j5',
    title: "লাইফ গুড রিভিউ দিন এবং ৫ স্টার দিন",
    reward: 3.5,
    category: "Review",
    description: "প্ল্যাটফর্ম রিভিউ বক্সে যান এবং সুন্দর একটি অনুপ্রেরণামূলক কমেন্ট লিখুন। কমেন্টের প্রমাণ হিসেবে টেক্সট দিন।",
    subscribersNeeded: 200,
    completedCount: 88
  },
  {
    id: 'j6',
    title: "CPA Offer: 'Pathao' বা 'Foodpanda' অ্যাপ ইন্সটল ও সাইনআপ (হাই-পেয়িং)",
    reward: 15.0,
    category: "App Install",
    url: "https://play.google.com/store/apps",
    description: "লিংক থেকে স্পন্সরের অ্যাপটি ডাউনলোড করে একটি নতুন একাউন্ট খুলুন। একাউন্ট খোলার পর প্রোফাইলের একটি স্ক্রিনশট প্রুফ হিসেবে জমা দিন।",
    subscribersNeeded: 500,
    completedCount: 145
  },
  {
    id: 'j7',
    title: "লোকাল প্রোমোশন: স্পন্সর রেস্টুরেন্ট ফেসবুক পেজে রিয়েল লাইক ও রিভিউ",
    reward: 5.0,
    category: "Facebook",
    url: "https://facebook.com",
    description: "আমাদের স্পন্সর পেজটিতে লাইক দিন এবং ৫-স্টার দিয়ে একটি সুন্দর রিভিউ লিখুন। (বি.দ্র: ফেক আইডি গ্রহণযোগ্য নয়)।",
    subscribersNeeded: 1000,
    completedCount: 890
  }
];

export const mockDriveOffers: DriveOffer[] = [
  {
    id: 'd1',
    provider: "Robi",
    title: "Robi Special Offer 25GB + 500 Minute",
    regularPrice: 590,
    offerPrice: 520,
    commission: 70,
    validity: "30 Days"
  },
  {
    id: 'd2',
    provider: "Grameenphone",
    title: "GP Super Offer 40GB Unlimited",
    regularPrice: 699,
    offerPrice: 619,
    commission: 80,
    validity: "30 Days"
  },
  {
    id: 'd3',
    provider: "Airtel",
    title: "Airtel Dhamaka Box 15GB + 300 Min",
    regularPrice: 420,
    offerPrice: 380,
    commission: 40,
    validity: "30 Days"
  },
  {
    id: 'd4',
    provider: "Banglalink",
    title: "BL Power Bundle 50GB Internet Only",
    regularPrice: 550,
    offerPrice: 495,
    commission: 55,
    validity: "30 Days"
  },
  {
    id: 'd5',
    provider: "Robi",
    title: "Robi Family Pack 10GB + 200 Min",
    regularPrice: 350,
    offerPrice: 310,
    commission: 40,
    validity: "15 Days"
  }
];

export const mockTrainingSections: TrainingSection[] = [
  {
    id: 's1',
    title: "Section 1: লাইভ গুড কি? কিভাবে ইনকাম শুরু করবেন?",
    videos: [
      { id: 'v1_1', title: "লাইভ গুড একাউন্ট কি ও কিভাবে ভেরিফাই করবেন?", duration: "14:00", watched: false },
      { id: 'v1_2', title: "লাইফ গুড কোম্পানির মূল লক্ষ্য ও ভবিষ্যত পরিকল্পনা কি?", duration: "10:50", watched: false },
      { id: 'v1_3', title: "কোম্পানীর ইনকাম ইসলামিক বা হালাল উপায়ে কিভাবে নির্ধারণ হয়?", duration: "12:40", watched: false }
    ],
    isUnlocked: true,
    isClaimed: false
  },
  {
    id: 's2',
    title: "Section 2: এডস মার্কেটিং কিভাবে করবেন ও ফ্রি ওয়েবসাইট লাভ?",
    videos: [
      { id: 'v2_1', title: "Ads Marketing কি ও এটি কিভাবে কাজ করে?", duration: "14:20", watched: false },
      { id: 'v2_2', title: "লাইভ গুড থেকে কিভাবে ১৫,০০০ টাকার ফ্রি নিউজ ওয়েবসাইট জিতবেন?", duration: "13:45", watched: false },
      { id: 'v2_3', title: "নিউজ ওয়েবসাইটের মাধ্যমে ঘরে বসে ডলার আয়ের নিয়ম", duration: "21:30", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's3',
    title: "Section 3: রিসেলিং শপ থেকে আনলিমিটেড পণ্য বিক্রি করে লাভ",
    videos: [
      { id: 'v3_1', title: "রিসেলিং একাউন্টের সঠিক সেটআপ এবং ডিলার রেট পাওয়ার নিয়ম", duration: "08:15", watched: false },
      { id: 'v3_2', title: "কাস্টমার পাওয়ার ও সোশ্যাল মিডিয়ায় পণ্য শেয়ার করার গোপন টিপস", duration: "12:40", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's4',
    title: "Section 4: প্রতি মাসে আজীবন কাজের জন্য ফিক্সড বেতন সেটআপ",
    videos: [
      { id: 'v4_1', title: "লেভেল অনুযায়ী প্রতি মাসে কোম্পানির পক্ষ থেকে ফিক্সড স্যালারি লাভ", duration: "09:00", watched: false },
      { id: 'v4_2', title: "প্যাসিভ ও রয়্যালটি ইনকাম বোনাস কিভাবে কাজ করে?", duration: "09:50", watched: false },
      { id: 'v4_3', title: "কোম্পানি বেতন বা স্যালারি প্রদানের সঠিক টাইমলাইন ও রিস্ট্রিকশন", duration: "17:40", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's5',
    title: "Section 5: ফেসবুক মার্কেটিং ও ফলোয়ার ট্রাফিক বৃদ্ধির টেকনিক",
    videos: [
      { id: 'v5_1', title: "নেটওয়ার্ক মার্কেটিংয়ের ইতিহাস ও কেন এটা সবার শ্রেষ্ঠ?", duration: "11:40", watched: false },
      { id: 'v5_2', title: "সোশ্যাল মিডিয়ায় প্রফেশনাল পোস্টার ও টেক্সট লেখার নিয়ম", duration: "10:10", watched: false },
      { id: 'v5_3', title: "ফেসবুকে দৈনিক ১০০+ রিয়েল গ্রাহক মেসেজ পাওয়ার উপায়", duration: "07:00", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's6',
    title: "Section 6: বড় টিম গঠন এবং রেফার ইনকাম সর্বোচ্চ করার উপায়",
    videos: [
      { id: 'v6_1', title: "লাইভ গুড কোম্পানির মূল রেফারেল ডিস্ট্রিবিউশন প্ল্যান ব্যাখ্যা", duration: "21:00", watched: false },
      { id: 'v6_2', title: "লিংক শেয়ারের মাধ্যমে সঠিক উপায়ে রেফার একাউন্ট খোলার নিয়ম", duration: "18:40", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's7',
    title: "Section 7: ড্রাইভ প্যাক সেল এবং প্রতি ড্রাইভে ৫০-১৫০ টাকা লাভ",
    videos: [
      { id: 'v7_1', title: "সব অপারেটরের মিনিট ও ডাটা ড্রাইভ প্যাক কেনার সঠিক পদ্ধতি", duration: "21:00", watched: false },
      { id: 'v7_2', title: "ড্রাইভ প্যাক বিক্রির পর কাস্টমারের নাম্বারে অ্যাক্টিভেশনের প্রুফ সাবমিশন", duration: "12:50", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's8',
    title: "Section 8: মাইক্রো জবস ও ছোট ছোট সোশ্যাল কাজ করে দৈনিক ইনকাম",
    videos: [
      { id: 'v8_1', title: "সহজ উপায়ে স্ক্রিনশট প্রুফ দিয়ে মাইক্রো জবস টাস্ক কমপ্লিট করা", duration: "04:00", watched: false },
      { id: 'v8_2', title: "ভুল ও সঠিক কাজের মধ্যে পার্থক্য এবং অ্যাকাউন্ট ব্যালেন্স বাড়ানো", duration: "11:50", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's9',
    title: "Section 9: ডিজিটাল সার্ভিস ও এনিমেশন কার্টুন ভিডিও কোর্স",
    videos: [
      { id: 'v9_1', title: "২ডি এবং ৩ডি এনিমেশন ভিডিও কার্টুন তৈরি মোবাইল দিয়ে", duration: "07:00", watched: false },
      { id: 'v9_2', title: "ভিডিও এডিটিং ও ব্যাকগ্রাউন্ড ভয়েস টিউনিং এর আধুনিক কোর্স", duration: "09:00", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 's10',
    title: "Section 10: পেমেন্ট বা ইনকাম উইথড্র করার নিয়ম ও বোনাস ক্লেইম",
    videos: [
      { id: 'v10_1', title: "বিকাশ, নগদ বা রকেটের মাধ্যমে টাকা ক্যাশআউট করার সঠিক নিয়ম", duration: "12:00", watched: false },
      { id: 'v10_2', title: "১০টি সেকশন ভিডিও দেখা শেষে ১০০০ টাকা ওয়েলকাম ডিরেক্ট বোনাস ক্লেইম", duration: "15:00", watched: false }
    ],
    isUnlocked: false,
    isClaimed: false
  }
];

export const mockSocialProofs = [
  { id: 'f1', name: "মোহাম্মদ ফরহাদ", amount: "১,৭০,৭৬৫ ৳", date: "২০২৪-১০-১৪", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", text: "আলহামদুলিল্লাহ! লাইভ গুড থেকে এটি আমার সেরা অর্জন ছিল। ধন্যবাদ লাইভ গুড।" },
  { id: 'f2', name: "মিমি ইসলাম", amount: "৪,৪১৯ ৳", date: "২০২৪-১০-১৬", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", text: "নতুন মেম্বার হয়েও গত ৩০ দিনে ৪,৪১৯ টাকা ইনকাম করতে পারলাম। খুব সহজ ও অসাধারণ একটি প্ল্যাটফর্ম।" },
  { id: 'f3', name: "শারমিন আক্তার", amount: "৩,০৬০ ৳", date: "২০২৪-১০-১৫", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop", text: "শুধুমাত্র একটি সেকশন ক্লেইম এবং কিছু রি-সেল ডিজাইন দিয়ে আজকের ইনকাম ৩,০৬০ টাকা!" },
  { id: 'f4', name: "আকাশ আহমেদ", amount: "৫১৮ ৳", date: "২০২৪-১০-১২", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", text: "আজকের ইনকাম শুরু হলো। ধন্যবাদ মেন্টরদের এতো সুন্দর সাপোর্ট দেওয়ার জন্য।" }
];
