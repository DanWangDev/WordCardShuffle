import type { Database } from 'better-sqlite3';
import type { Migration } from '../config/migrator';

export const addTimedQuizType: Migration = {
  name: '023_add_timed_quiz_type',
  up: (db: Database) => {
    // SQLite doesn't support ALTER TABLE to modify CHECK constraints.
    // We need to recreate the table. Preserve all data.
    db.prepare(`
      CREATE TABLE quiz_results_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quiz_type TEXT NOT NULL CHECK(quiz_type IN ('quiz', 'challenge', 'timed')),
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        score REAL NOT NULL,
        time_per_question INTEGER,
        total_time_spent INTEGER NOT NULL DEFAULT 0,
        points_earned INTEGER NOT NULL DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run();

    db.prepare(`
      INSERT INTO quiz_results_new (id, user_id, quiz_type, total_questions, correct_answers, score, time_per_question, total_time_spent, points_earned, completed_at)
      SELECT id, user_id, quiz_type, total_questions, correct_answers, score, time_per_question, total_time_spent, points_earned, completed_at
      FROM quiz_results
    `).run();

    db.prepare('DROP TABLE quiz_results').run();
    db.prepare('ALTER TABLE quiz_results_new RENAME TO quiz_results').run();

    // Recreate indexes
    db.prepare('CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_quiz_results_type ON quiz_results(quiz_type)').run();
  }
};
