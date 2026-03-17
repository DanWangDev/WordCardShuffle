import { createContext } from 'react';
import type { NewlyEarnedAchievement } from '../services/api/achievementApi';

export interface AchievementContextValue {
  showAchievements: (achievements: NewlyEarnedAchievement[]) => void;
}

export const AchievementContext = createContext<AchievementContextValue | null>(null);
