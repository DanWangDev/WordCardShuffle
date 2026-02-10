import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validate, importDataSchema } from '../middleware/validate.js';
import { settingsRepository, statsRepository } from '../repositories/userRepository.js';
import type { AuthRequest, UserSettings, UserStats } from '../types/index.js';

const router = Router();

// All migration routes require authentication
router.use(authMiddleware);

// POST /api/migrate/import - Import data from localStorage
router.post('/import', validate(importDataSchema), (req: AuthRequest, res: Response) => {
  try {
    const { settings, stats } = req.body;
    const userId = req.user!.userId;

    let importedSettings: UserSettings | null = null;
    let importedStats: UserStats | null = null;

    // Import settings if provided
    if (settings) {
      const updatedSettings = settingsRepository.update(
        userId,
        settings.soundEnabled,
        settings.autoAdvance,
        settings.language
      );
      importedSettings = {
        soundEnabled: updatedSettings.sound_enabled === 1,
        autoAdvance: updatedSettings.auto_advance === 1,
        language: updatedSettings.language || 'en'
      };
    }

    // Import stats if provided
    if (stats) {
      // Get current stats to decide whether to merge or replace
      const currentStats = statsRepository.get(userId);

      if (currentStats) {
        // Merge strategy: take the higher value for each field
        const mergedStats = {
          totalWordsStudied: Math.max(currentStats.total_words_studied, stats.totalWordsStudied || 0),
          quizzesTaken: Math.max(currentStats.quizzes_taken, stats.quizzesTaken || 0),
          challengesCompleted: Math.max(currentStats.challenges_completed, stats.challengesCompleted || 0),
          bestChallengeScore: Math.max(currentStats.best_challenge_score, stats.bestChallengeScore || 0),
          lastStudyDate: stats.lastStudyDate || currentStats.last_study_date
        };

        const updatedStats = statsRepository.update(userId, mergedStats);
        importedStats = {
          totalWordsStudied: updatedStats.total_words_studied,
          quizzesTaken: updatedStats.quizzes_taken,
          challengesCompleted: updatedStats.challenges_completed,
          bestChallengeScore: updatedStats.best_challenge_score,
          lastStudyDate: updatedStats.last_study_date
        };
      }
    }

    res.json({
      message: 'Data imported successfully',
      settings: importedSettings,
      stats: importedStats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to import data'
    });
  }
});

// GET /api/migrate/export - Export user data
router.get('/export', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const settingsRow = settingsRepository.get(userId);
    const statsRow = statsRepository.get(userId);

    const settings: UserSettings = settingsRow ? {
      soundEnabled: settingsRow.sound_enabled === 1,
      autoAdvance: settingsRow.auto_advance === 1,
      language: settingsRow.language || 'en'
    } : {
      soundEnabled: true,
      autoAdvance: false,
      language: 'en'
    };

    const stats: UserStats = statsRow ? {
      totalWordsStudied: statsRow.total_words_studied,
      quizzesTaken: statsRow.quizzes_taken,
      challengesCompleted: statsRow.challenges_completed,
      bestChallengeScore: statsRow.best_challenge_score,
      lastStudyDate: statsRow.last_study_date
    } : {
      totalWordsStudied: 0,
      quizzesTaken: 0,
      challengesCompleted: 0,
      bestChallengeScore: 0,
      lastStudyDate: null
    };

    res.json({
      settings,
      stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to export data'
    });
  }
});

export default router;
