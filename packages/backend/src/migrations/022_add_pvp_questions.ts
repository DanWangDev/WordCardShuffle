import type { Database } from 'better-sqlite3';
import type { Migration } from '../config/migrator';

export const addPvpQuestions: Migration = {
  name: '022_add_pvp_questions',
  up: (db: Database) => {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS pvp_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL REFERENCES pvp_challenges(id) ON DELETE CASCADE,
        question_index INTEGER NOT NULL,
        word TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        options TEXT NOT NULL,
        UNIQUE(challenge_id, question_index)
      )
    `).run();

    db.prepare('CREATE INDEX IF NOT EXISTS idx_pvp_questions_challenge ON pvp_questions(challenge_id)').run();

    db.prepare(`
      ALTER TABLE pvp_challenges ADD COLUMN rematch_of INTEGER REFERENCES pvp_challenges(id)
    `).run();

    db.prepare(`
      INSERT INTO achievements (slug, name, description, icon, category, threshold, sort_order) VALUES
        ('pvp_wins_5', 'PvP Warrior', 'Win 5 PvP challenges', 'swords', 'challenge', 5, 32),
        ('pvp_wins_10', 'PvP Champion', 'Win 10 PvP challenges', 'crown', 'challenge', 10, 33),
        ('pvp_streak_3', 'Winning Streak', 'Win 3 PvP challenges in a row', 'flame', 'challenge', 3, 34),
        ('spelling_20', 'Spelling Bee', 'Spell 20 words correctly', 'pencil', 'quiz', 20, 6),
        ('perfect_speller', 'Perfect Speller', 'Score 100% on a 15-word spelling session', 'sparkles', 'quiz', 15, 7),
        ('speed_round', 'Speed Round', 'Score 80%+ on a timed quiz', 'timer', 'quiz', 80, 8),
        ('time_master', 'Time Master', 'Complete 10 timed quizzes', 'clock', 'quiz', 10, 9)
    `).run();
  }
};
