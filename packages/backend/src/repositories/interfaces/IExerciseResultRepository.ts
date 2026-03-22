export interface ExerciseResultRow {
  id: number;
  user_id: number;
  exercise_type: 'sentence_build' | 'spelling';
  wordlist_id: number | null;
  total_questions: number;
  correct_answers: number;
  score: number;
  total_time_spent: number | null;
  completed_at: string;
}

export interface ExerciseAnswerRow {
  id: number;
  exercise_result_id: number;
  question_index: number;
  word: string;
  correct_answer: string;
  user_answer: string | null;
  is_correct: number;
  time_spent: number | null;
}

export interface CreateExerciseResultParams {
  userId: number;
  exerciseType: 'sentence_build' | 'spelling';
  wordlistId: number | null;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  totalTimeSpent: number | null;
  answers: ReadonlyArray<{
    questionIndex: number;
    word: string;
    correctAnswer: string;
    userAnswer: string | null;
    isCorrect: boolean;
    timeSpent: number | null;
  }>;
}

export interface IExerciseResultRepository {
  create(params: CreateExerciseResultParams): number;
  getByUserId(userId: number, exerciseType?: string): ExerciseResultRow[];
  getAnswersByResultId(resultId: number): ExerciseAnswerRow[];
  getCountByUserId(userId: number, exerciseType?: string): number;
  getRecentAccuracy(userId: number, exerciseType?: string): number;
}
