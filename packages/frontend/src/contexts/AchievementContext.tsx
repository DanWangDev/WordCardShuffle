import { useState, useCallback, useRef } from 'react';
import { AchievementUnlockedToast } from '../components/achievements/AchievementUnlockedToast';
import { AchievementContext } from './achievementContextDef';
import type { NewlyEarnedAchievement } from '../services/api/achievementApi';

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<NewlyEarnedAchievement | null>(null);
  const queueRef = useRef<NewlyEarnedAchievement[]>([]);

  const showNext = useCallback(() => {
    if (queueRef.current.length > 0) {
      const [next, ...rest] = queueRef.current;
      queueRef.current = rest;
      setCurrent(next);
    } else {
      setCurrent(null);
    }
  }, []);

  const showAchievements = useCallback((achievements: NewlyEarnedAchievement[]) => {
    if (achievements.length === 0) return;
    queueRef.current = [...queueRef.current, ...achievements];
    // Only kick off display if nothing is currently showing
    setCurrent(prev => {
      if (prev) return prev;
      const [next, ...rest] = queueRef.current;
      queueRef.current = rest;
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    showNext();
  }, [showNext]);

  return (
    <AchievementContext.Provider value={{ showAchievements }}>
      {children}
      <AchievementUnlockedToast achievement={current} onClose={handleClose} />
    </AchievementContext.Provider>
  );
}
