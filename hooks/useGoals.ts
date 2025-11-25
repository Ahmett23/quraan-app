import { useState, useEffect } from 'react';

export interface Goal {
  id: string;
  type: 'KHATMAH' | 'SURAH';
  title: string;
  targetId?: number; // Surah ID
  totalPages: number;
  startPageNumber: number; // The page number where this goal starts in the Quran
  durationDays: number;
  dailyTargetPages: number;
  completedPages: number;
  startDate: string; // ISO Date
  lastProgressDate?: string; // ISO Date
  isCompleted: boolean;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(null);

  useEffect(() => {
    // Load data
    const storedGoals = localStorage.getItem('quran_app_goals');
    const storedStreak = localStorage.getItem('quran_app_streak');
    const storedLastDate = localStorage.getItem('quran_app_last_streak_date');

    if (storedGoals) {
      const parsedGoals = JSON.parse(storedGoals);
      // Migration for old goals that might miss startPageNumber
      const migratedGoals = parsedGoals.map((g: any) => ({
        ...g,
        startPageNumber: g.startPageNumber || 1
      }));
      setGoals(migratedGoals);
    }
    if (storedStreak) setStreak(parseInt(storedStreak, 10));
    if (storedLastDate) setLastStreakDate(storedLastDate);
  }, []);

  const saveToStorage = (newGoals: Goal[], newStreak: number, newLastDate: string | null) => {
    localStorage.setItem('quran_app_goals', JSON.stringify(newGoals));
    localStorage.setItem('quran_app_streak', newStreak.toString());
    if (newLastDate) localStorage.setItem('quran_app_last_streak_date', newLastDate);
  };

  const addGoal = (
    type: 'KHATMAH' | 'SURAH',
    title: string,
    totalPages: number,
    startPageNumber: number,
    durationDays: number,
    targetId?: number
  ) => {
    const dailyTarget = Math.ceil(totalPages / durationDays);
    const newGoal: Goal = {
      id: Date.now().toString(),
      type,
      title,
      targetId,
      totalPages,
      startPageNumber,
      durationDays,
      dailyTargetPages: dailyTarget,
      completedPages: 0,
      startDate: new Date().toISOString(),
      isCompleted: false,
    };

    const newGoals = [...goals, newGoal];
    setGoals(newGoals);
    saveToStorage(newGoals, streak, lastStreakDate);
  };

  const deleteGoal = (id: string) => {
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    saveToStorage(newGoals, streak, lastStreakDate);
  };

  const markDailyProgress = (goalId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Update Goals
    const newGoals = goals.map(goal => {
      if (goal.id === goalId) {
        // Add daily target pages to completed, but don't exceed total
        const newCompleted = Math.min(goal.completedPages + goal.dailyTargetPages, goal.totalPages);
        return {
          ...goal,
          completedPages: newCompleted,
          lastProgressDate: today,
          isCompleted: newCompleted >= goal.totalPages
        };
      }
      return goal;
    });

    // Update Streak
    let newStreak = streak;
    let newLastDate = lastStreakDate;

    if (lastStreakDate !== today) {
      // Check if streak is broken (missed yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // If last streak was yesterday, increment. If null (first time), start at 1.
      if (lastStreakDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastStreakDate === null) {
        newStreak = 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      newLastDate = today;
    }

    setGoals(newGoals);
    setStreak(newStreak);
    setLastStreakDate(newLastDate);
    saveToStorage(newGoals, newStreak, newLastDate);
  };

  return { goals, streak, addGoal, deleteGoal, markDailyProgress };
};