import { getTodayKey, isYesterday, isSameDay } from './date';
import { ReadingStreak, StreakMilestone } from '../types';

export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90, 180, 365];

export function calculateStreak(
  lastReadDate: string | null,
  currentStreak: number
): { newStreak: number; isBroken: boolean } {
  if (!lastReadDate) return { newStreak: 1, isBroken: false };

  const today = new Date();
  const last = new Date(lastReadDate);

  if (isSameDay(today, last)) {
    return { newStreak: currentStreak, isBroken: false };
  }

  if (isYesterday(last)) {
    return { newStreak: currentStreak + 1, isBroken: false };
  }

  return { newStreak: 1, isBroken: currentStreak > 0 };
}

export function isStreakAlive(lastReadDate: string | null): boolean {
  if (!lastReadDate) return false;
  const today = new Date();
  const last = new Date(lastReadDate);
  return isSameDay(today, last) || isYesterday(last);
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '👑';
  if (streak >= 180) return '🏆';
  if (streak >= 90) return '💎';
  if (streak >= 60) return '🥇';
  if (streak >= 30) return '🔥';
  if (streak >= 14) return '⭐';
  if (streak >= 7) return '✨';
  return '🌱';
}

export function getNextMilestone(currentStreak: number): number | null {
  return STREAK_MILESTONES.find((m) => m > currentStreak) ?? null;
}

export function getMilestoneProgress(currentStreak: number): {
  current: number;
  next: number | null;
  progress: number;
} {
  const next = getNextMilestone(currentStreak);
  const prev = [...STREAK_MILESTONES].reverse().find((m) => m <= currentStreak) ?? 0;

  if (!next) return { current: currentStreak, next: null, progress: 1 };

  const progress = (currentStreak - prev) / (next - prev);
  return { current: currentStreak, next, progress: Math.min(progress, 1) };
}

export function checkMilestoneAchieved(
  oldStreak: number,
  newStreak: number
): number | null {
  return STREAK_MILESTONES.find((m) => m > oldStreak && m <= newStreak) ?? null;
}

export function getStreakBadge(streak: number): string {
  if (streak >= 365) return 'Year Champion';
  if (streak >= 180) return '6 Month Warrior';
  if (streak >= 90) return '90 Day Hero';
  if (streak >= 60) return '60 Day Achiever';
  if (streak >= 30) return 'Monthly Devotee';
  if (streak >= 14) return '2 Week Faithful';
  if (streak >= 7) return 'Week Warrior';
  if (streak >= 3) return 'Getting Started';
  return 'New Believer';
}

export function generateWeeklyView(
  lastReadDate: string | null,
  currentStreak: number
): Array<{ date: string; completed: boolean; isToday: boolean }> {
  const today = new Date();
  const days: Array<{ date: string; completed: boolean; isToday: boolean }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const isToday = i === 0;
    let completed = false;

    if (lastReadDate && currentStreak > 0) {
      const last = new Date(lastReadDate);
      const diffFromToday = today.getTime() - d.getTime();
      const dayDiff = Math.floor(diffFromToday / (1000 * 60 * 60 * 24));
      completed = dayDiff < currentStreak;
    }

    days.push({ date: key, completed, isToday });
  }

  return days;
}

export function formatStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Day 1 - Great start!';
  if (streak < 7) return `${streak} days - Keep going!`;
  if (streak < 14) return `${streak} days - One week complete!`;
  if (streak < 30) return `${streak} days - You're on fire!`;
  if (streak < 60) return `${streak} days - Incredible consistency!`;
  if (streak < 90) return `${streak} days - You're a champion!`;
  return `${streak} days - Legendary devotion!`;
}
