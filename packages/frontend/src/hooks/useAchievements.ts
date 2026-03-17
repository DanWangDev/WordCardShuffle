import { useContext } from 'react';
import { AchievementContext } from '../contexts/achievementContextDef';

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return ctx;
}
