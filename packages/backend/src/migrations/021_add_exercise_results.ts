import type { Database } from 'better-sqlite3';
import type { Migration } from '../config/migrator';

export const addExerciseResults: Migration = {
  name: '021_add_exercise_results',
  up: (db: Database) => {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS exercise_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exercise_type TEXT NOT NULL CHECK(exercise_type IN ('sentence_build', 'spelling')),
        wordlist_id INTEGER REFERENCES wordlists(id) ON DELETE SET NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        score REAL NOT NULL,
        total_time_spent INTEGER,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    db.prepare(`
      CREATE TABLE IF NOT EXISTS exercise_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_result_id INTEGER NOT NULL REFERENCES exercise_results(id) ON DELETE CASCADE,
        question_index INTEGER NOT NULL,
        word TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        user_answer TEXT,
        is_correct INTEGER NOT NULL DEFAULT 0,
        time_spent INTEGER
      )
    `).run();

    db.prepare('CREATE INDEX IF NOT EXISTS idx_exercise_results_user ON exercise_results(user_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_exercise_results_type ON exercise_results(exercise_type)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_exercise_answers_result ON exercise_answers(exercise_result_id)').run();
  }
};
