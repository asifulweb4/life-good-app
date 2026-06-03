/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle2, Lock, Gift, Award, ArrowLeft, Hourglass, Sparkles } from 'lucide-react';
import { TrainingSection, CourseVideo } from '../types';

interface WelcomeOfferCoursesProps {
  sections: TrainingSection[];
  onClaimReward: (sectionId: string, amount: number) => void;
  onUpdateSections: (updatedSections: TrainingSection[]) => void;
  walletBalance: number;
}

export default function WelcomeOfferCourses({
  sections,
  onClaimReward,
  onUpdateSections,
  walletBalance
}: WelcomeOfferCoursesProps) {
  const [selectedSection, setSelectedSection] = useState<TrainingSection | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{ sectionId: string; video: CourseVideo } | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [simulatedPlaying, setSimulatedPlaying] = useState(false);

  // Watch video simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulatedPlaying && videoProgress < 100) {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setSimulatedPlaying(false);
            setIsVideoFinished(true);
            return 100;
          }
          return prev + 10; // 10% progress every 400ms (fast for demo, looks great)
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [simulatedPlaying, videoProgress]);

  const startVideo = (sectionId: string, video: CourseVideo) => {
    // If already watched, just play for fun
    setPlayingVideo({ sectionId, video });
    setVideoProgress(video.watched ? 100 : 0);
    setIsVideoFinished(video.watched);
    setSimulatedPlaying(!video.watched);
  };

  const handleFinishVideo = () => {
    if (!playingVideo) return;
    const { sectionId, video } = playingVideo;

    // Update section and video watched state
    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        const updatedVideos = sec.videos.map((vid) => {
          if (vid.id === video.id) {
            return { ...vid, watched: true };
          }
          return vid;
        });
        return { ...sec, videos: updatedVideos };
      }
      return sec;
    });

    onUpdateSections(updated);

    // Update locally selected portion as well
    const matchedSec = updated.find((s) => s.id === sectionId);
    if (matchedSec) {
      setSelectedSection(matchedSec);
    }

    setPlayingVideo(null);
  };

  const claimSectionReward = (sec: TrainingSection) => {
    const allWatched = sec.videos.every((v) => v.watched);
    if (!allWatched || sec.isClaimed) return;

    // Give 100 Taka reward dynamically
    onClaimReward(sec.id, 100);

    // Unlock next section
    const secIndex = sections.findIndex((s) => s.id === sec.id);
    const updated = sections.map((s, idx) => {
      if (s.id === sec.id) {
        return { ...s, isClaimed: true };
      }
      if (idx === secIndex + 1) {
        return { ...s, isUnlocked: true };
      }
      return s;
    });

    onUpdateSections(updated);
    
    // Update locally selected portion
    const matchedSec = updated.find((s) => s.id === sec.id);
    if (matchedSec) {
      setSelectedSection(matchedSec);
    }
  };

  const getTotalEarniable = () => sections.length * 100;
  const getClaimedCount = () => sections.filter((s) => s.isClaimed).length;
  const progressPercent = (getClaimedCount() / sections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6" id="welcome-offer-courses">
      {/* Return to Sections selection trigger */}
      {selectedSection ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedSection(null)}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-medium transition-all group bg-purple-50/70 border border-purple-100 hover:bg-purple-100 px-4 py-2 rounded-full"
            id="back-to-course-list"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            ফোর্স লিস্টে ফিরে যান
          </button>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-purple-100/80 p-6 shadow-xl shadow-purple-50">
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600 mb-2">
              {selectedSection.title}
            </h2>
            <p className="text-sm text-purple-600 mb-6 bg-pink-50/50 p-3 rounded-xl border border-pink-100/60 inline-block">
              💡 প্রতিটি ভিডিও ১০০% শেষ করুন এবং ১০০ টাকা ওয়েলকাম বোনাস ক্লেইম করুন!
            </p>

            <div className="space-y-4">
              {selectedSection.videos.map((video, idx) => (
                <div
                  key={video.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-white to-purple-50/40 border border-purple-100 hover:shadow-md transition-shadow gap-4"
                  id={`video-card-${video.id}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-pink-100/80 text-pink-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-purple-950 text-base sm:text-lg leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                        ভিডিওর দৈর্ঘ্য: {video.duration} মিনিট
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => startVideo(selectedSection.id, video)}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shrink-0 ${
                      video.watched
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-md shadow-pink-100'
                    }`}
                    id={`play-button-${video.id}`}
                  >
                    {video.watched ? (
                      <>
                        <CheckCircle2 size={16} />
                        সম্পূর্ণ দেখা হয়েছে
                      </>
                    ) : (
                      <>
                        <Play size={16} fill="currentColor" />
                        ভিডিও প্লে করুন
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Claim Reward Button block */}
            <div className="mt-8 pt-6 border-t border-purple-100 flex flex-col items-center">
              {selectedSection.isClaimed ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-6 py-4 rounded-2xl font-bold">
                  <CheckCircle2 size={24} />
                  <span>আপনি সফলভাবে এই সেকশনের ১০০ ৳ বোনাস ক্লেইম করেছেন!</span>
                </div>
              ) : selectedSection.videos.every((v) => v.watched) ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => claimSectionReward(selectedSection)}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-lg shadow-lg shadow-pink-200 cursor-pointer animate-pulse"
                  id="claim-bonus-btn"
                >
                  <Gift size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
                  ১০০ ৳ ওয়েলকাম বোনাস ক্লেইম করুন!
                </motion.button>
              ) : (
                <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100 max-w-md">
                  <Lock className="mx-auto text-purple-400 mb-2" size={24} />
                  <p className="text-purple-800 font-medium text-sm">
                    বোনাস ক্লেইম করতে এই সেকশনের সবগুলো ভিডিও সম্পূর্ণরূপে ১০০% দেখুন।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Welcome Dashboard Tracker Card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-100 relative overflow-hidden" id="courses-header-banner">
            {/* Ambient decorative overlays */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-4 translate-x-4"></div>
            <div className="absolute left-1/3 bottom-0 w-24 h-24 bg-pink-300/20 rounded-full blur-xl translate-y-6"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                  <Sparkles size={12} className="text-white" />
                  Welcome Bonus Pack
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  ওয়েলকাম ট্রেনিং ও বোনাস কোর্স
                </h1>
                <p className="text-sm opacity-90 max-w-xl">
                  প্রতিটি সেকশন ভিডিও সম্পূর্ণ দেখার জন্য ১০০ ৳ বোনাস পান। সব ভিডিও দেখে জিতে নিন মোট <strong className="text-yellow-300">{getTotalEarniable()} ৳</strong> ওয়েলকাম বোনাস!
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/25 text-center shrink-0 min-w-36">
                <p className="text-xs uppercase font-extrabold opacity-80">ক্লেইমকৃত বোনাস</p>
                <p className="text-2xl sm:text-3xl font-black text-yellow-300 mt-1">
                  {getClaimedCount() * 100} ৳
                </p>
                <p className="text-[10px] opacity-75 mt-0.5">মোট ১০টি সেকশনের মধ্যে {getClaimedCount()}টি ক্লেইমড</p>
              </div>
            </div>

            {/* Progress bar container */}
            <div className="mt-6 pt-5 border-t border-white/20 relative z-10">
              <div className="flex justify-between text-xs font-medium opacity-90 mb-1.5">
                <span> কোর্স অগ্রগতি</span>
                <span>{Math.round(progressPercent)}% ফিনিশড</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div
                  className="bg-yellow-300 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Grid list of sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="sections-grid">
            {sections.map((sec, idx) => {
              const allWatched = sec.videos.every((v) => v.watched);
              return (
                <motion.div
                  key={sec.id}
                  whileHover={sec.isUnlocked ? { scale: 1.015, y: -2 } : {}}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between h-48 overflow-hidden bg-white/95 backdrop-blur shadow-md ${
                    sec.isUnlocked
                      ? 'border-purple-100 hover:border-pink-300 hover:shadow-lg shadow-purple-50 cursor-pointer'
                      : 'border-purple-50/60 opacity-65 bg-purple-50/20 shadow-none'
                  }`}
                  onClick={() => sec.isUnlocked && setSelectedSection(sec)}
                  id={`section-item-${sec.id}`}
                >
                  <div>
                    {/* Header line for section */}
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        sec.isClaimed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : allWatched
                          ? 'bg-pink-100 text-pink-700 border border-pink-200 animate-pulse'
                          : 'bg-purple-50 text-purple-700 border border-purple-100'
                      }`}>
                        {sec.isClaimed ? 'ক্লেইমড ১০০ ৳' : allWatched ? 'ক্লেইম করুন!' : 'ভিডিও দেখুন'}
                      </span>
                      {!sec.isUnlocked && <Lock size={16} className="text-purple-300" />}
                    </div>

                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                      {sec.title.replace(/^Section \d+:\s*/, '')}
                    </h3>
                    <p className="text-xs text-purple-600 font-semibold mt-1">
                      সেকশন {idx + 1} • {sec.videos.length}টি ক্লাসের সংকলন
                    </p>
                  </div>

                  {/* Actions summary at footer of cards */}
                  <div className="flex items-center justify-between border-t border-purple-50 pt-3 mt-3">
                    <span className="text-xs text-gray-500 font-medium">
                      সম্পূর্ণ ট্র্যাকিং: {sec.videos.filter((v) => v.watched).length}/{sec.videos.length} ভিডিও
                    </span>

                    {sec.isClaimed ? (
                      <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> বোনাস সফল
                      </span>
                    ) : !sec.isUnlocked ? (
                      <span className="text-purple-300 text-xs font-semibold flex items-center gap-1">
                        <Lock size={12} /> পূর্ববর্তী শেষ করুন
                      </span>
                    ) : allWatched ? (
                      <span className="text-pink-600 text-xs font-extrabold flex items-center gap-1 animate-bounce">
                        <Gift size={14} /> ক্লেইম ১০০ ৳
                      </span>
                    ) : (
                      <span className="text-purple-600 text-xs font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform">
                        ক্লাস শুরু <Play size={10} fill="currentColor" />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Video Simulation Overlay Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <div className="fixed inset-0 bg-purple-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-purple-100"
              id="mock-video-player"
            >
              {/* Fake Video Box Frame */}
              <div className="relative bg-gradient-to-br from-purple-900 to-pink-800 aspect-video flex flex-col justify-between p-6 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-15">
                  {/* Decorative sound waves */}
                  <div className="w-full h-full flex items-center justify-around">
                    {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 1, 4, 1, 2].map((h, i) => (
                      <div
                        key={i}
                        className="bg-white w-1.5 rounded-full animate-pulse"
                        style={{
                          height: `${h * 15}%`,
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '1s'
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 flex justify-between items-start">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 bg-white/20 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-inner text-yellow-300">
                    <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
                    Live Class
                  </span>
                  <span className="text-xs text-white/80 shrink-0 select-none">
                    দৈর্ঘ্য: {playingVideo.video.duration}মিঃ
                  </span>
                </div>

                {/* Simulated playback states */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4 my-4">
                  {simulatedPlaying ? (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/60 animate-ping" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-emerald-500/80 flex items-center justify-center text-white border-2 border-emerald-300 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={32} />
                    </div>
                  )}
                  <h3 className="font-extrabold text-white text-lg text-center max-w-md drop-shadow-sm px-4">
                    {playingVideo.video.title}
                  </h3>
                  {simulatedPlaying && (
                    <p className="text-xs text-pink-200/90 tracking-wide font-medium flex items-center gap-1 bg-white/15 px-3 py-1.5 rounded-full backdrop-blur">
                      <Hourglass size={12} className="animate-spin" />
                      ভিডিও ক্লাসে জয়েন আছেন...
                    </p>
                  )}
                </div>

                <div className="relative z-10 space-y-2 mt-2">
                  <div className="flex justify-between items-center text-xs text-white/90">
                    <span>প্রগ্রেস: {Math.round(videoProgress)}%</span>
                    <span>{simulatedPlaying ? 'লোডিং...' : 'সম্পূর্ণ!'}</span>
                  </div>
                  <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-300 to-amber-300 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-5 bg-purple-50/45 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-purple-700 font-medium text-center sm:text-left">
                  {simulatedPlaying
                    ? "⚠️ ভিডিও চলাকালীন অন্য পাতায় যাবেন না, প্রগ্রেস ট্র্যাকিং ব্যাহত হতে পারে।"
                    : "🎉 অভিনন্দন! আপনি ক্লাসটি সম্পূর্ণরূপে সফলভাবে সম্পন্ন করেছেন।"}
                </p>

                <div className="flex gap-2">
                  {simulatedPlaying && (
                    <button
                      onClick={() => {
                        setSimulatedPlaying(false);
                        setPlayingVideo(null);
                      }}
                      className="px-4 py-2 border border-purple-200 hover:bg-white text-purple-700 font-bold text-sm rounded-full transition-colors"
                    >
                      বন্ধ করুন
                    </button>
                  )}
                  {isVideoFinished && (
                    <button
                      onClick={handleFinishVideo}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-sm rounded-full shadow-lg shadow-pink-100 transition-shadow select-none"
                      id="save-video-progress"
                    >
                      প্রগতি সংরক্ষণ করুন
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
