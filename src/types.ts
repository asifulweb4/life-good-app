/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  code: string;
  wholesalePrice: number;
  regularPrice: number;
  image: string;
  category: string;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  reward: number;
  category: string;
  url?: string;
  description: string;
  subscribersNeeded: number;
  completedCount: number;
  isCompleted?: boolean;
}

export interface CourseVideo {
  id: string;
  title: string;
  duration: string;
  watched: boolean;
}

export interface TrainingSection {
  id: string;
  title: string;
  videos: CourseVideo[];
  isUnlocked: boolean;
  isClaimed: boolean;
}

export interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'deposit';
  amount: number;
  title: string;
  date: string;
  status: 'pending' | 'success' | 'failed';
  paymentMethod?: string;
  recipient?: string;
}

export interface DriveOffer {
  id: string;
  provider: 'Robi' | 'Grameenphone' | 'Banglalink' | 'Airtel' | 'Teletalk';
  title: string;
  regularPrice: number;
  offerPrice: number;
  commission: number;
  validity: string;
}

export interface EarningsState {
  currentBalance: number;
  todayEarnings: number;
  yesterdayEarnings: number;
  last7DaysEarnings: number;
  totalEarnings: number;
  transactions: Transaction[];
}

export interface UserRank {
  level: number;
  title: string;
  totalVerifiedMembersNeeded: number;
  currentVerifiedMembers: number;
  monthlySalaryAmount: number;
}
