import type { Database } from 'better-sqlite3';
import type {
  IExerciseResultRepository,
  ExerciseResultRow,
  ExerciseAnswerRow,
  CreateExerciseResultParams,
} from '../interfaces/IExerciseResultRepository.js';

export class SqliteExerciseResultRepository implements IExerciseResultRepository {
  constructor(private readonly db: Database) {}

  create(params: CreateExerciseResultParams): number {
    const insertResult = this.db.prepare(`
      INSERT INTO exercise_results (user_id, exercise_type, wordlist_id, total_questions, correct_answers, score, total_time_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAnswer = this.db.prepare(`
      INSERT INTO exercise_answers (exercise_result_id, question_index, word, correct_answer, user_answer, is_correct, time_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      const result = insertResult.run(
        params.userId,
        params.exerciseType,
        params.wordlistId,
        params.totalQuestions,
        params.correctAnswers,
        params.score,
        params.totalTimeSpent
      );
      const resultId = Number(result.lastInsertRowid);

      for (const answer of params.answers) {
        insertAnswer.run(
          resultId,
          answer.questionIndex,
          answer.word,
          answer.correctAnswer,
          answer.userAnswer,
          answer.isCorrect ? 1 : 0,
          answer.timeSpent
        );
      }

      return resultId;
    });

    return transaction();
  }

  getByUserId(userId: number, exerciseType?: string): ExerciseResultRow[] {
    if (exerciseType) {
      return this.db
        .prepare(
          'SELECT * FROM exercise_results WHERE user_id = ? AND exercise_type = ? ORDER BY completed_at DESC'
        )
        .all(userId, exerciseType) as ExerciseResultRow[];
    }
    return this.db
      .prepare(
        'SELECT * FROM exercise_results WHERE user_id = ? ORDER BY completed_at DESC'
      )
      .all(userId) as ExerciseResultRow[];
  }

  getAnswersByResultId(resultId: number): ExerciseAnswerRow[] {
    return this.db
      .prepare(
        'SELECT * FROM exercise_answers WHERE exercise_result_id = ? ORDER BY question_index'
      )
      .all(resultId) as ExerciseAnswerRow[];
  }

  getCountByUserId(userId: number, exerciseType?: string): number {
    if (exerciseType) {
      const row = this.db
        .prepare(
          'SELECT COUNT(*) as count FROM exercise_results WHERE user_id = ? AND exercise_type = ?'
        )
        .get(userId, exerciseType) as { count: number };
      return row.count;
    }
    const row = this.db
      .prepare(
        'SELECT COUNT(*) as count FROM exercise_results WHERE user_id = ?'
      )
      .get(userId) as { count: number };
    return row.count;
  }

  getRecentAccuracy(userId: number, exerciseType?: string): number {
    const query = exerciseType
      ? 'SELECT COALESCE(ROUND(AVG(score), 0), 0) as avg FROM exercise_results WHERE user_id = ? AND exercise_type = ?'
      : 'SELECT COALESCE(ROUND(AVG(score), 0), 0) as avg FROM exercise_results WHERE user_id = ?';
    const params = exerciseType ? [userId, exerciseType] : [userId];
    const row = this.db.prepare(query).get(...params) as { avg: number };
    return row.avg;
  }
}
