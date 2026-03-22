import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Home, Loader2, Inbox } from 'lucide-react';
import { SpellingSetup } from './SpellingSetup';
import { SpellingCard } from './SpellingCard';
import { exerciseApi, type SpellingExercise } from '../../services/api/exerciseApi';
import { useApp } from '../../contexts/AppContext';
import { useAchievements } from '../../hooks/useAchievements';

interface AnswerRecord {
  questionIndex: number;
  word: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timeSpent: number;
}

export function SpellingSession() {
  const { t } = useTranslation('exercises');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeWordlist } = useApp();
  const { showAchievements } = useAchievements();
  const wordlistId = parseInt(searchParams.get('wordlistId') || '0', 10) || activeWordlist?.id || 0;

  const [mode, setMode] = useState<'definition' | 'fill_blank'>('definition');
  const [exercises, setExercises] = useState<SpellingExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<'setup' | 'active' | 'complete'>('setup');
  const [resolvedWordlistId, setResolvedWordlistId] = useState<number>(wordlistId);
  const sessionStartRef = useRef(Date.now());

  const fetchExercises = useCallback(async (selectedMode: 'definition' | 'fill_blank', count: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await exerciseApi.getSpelling(wordlistId || undefined, selectedMode, count);
      if (data.wordlistId) setResolvedWordlistId(data.wordlistId);
      setExercises(data.exercises);
      setCurrentIndex(0);
      setAnswers([]);
      sessionStartRef.current = Date.now();
      setPhase('active');
    } catch {
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, [wordlistId]);

  const handleStart = (config: { mode: 'definition' | 'fill_blank'; questionCount: number }) => {
    setMode(config.mode);
    fetchExercises(config.mode, config.questionCount);
  };

  const handleResult = (correct: boolean, timeSpent: number) => {
    const exercise = exercises[currentIndex];
    setAnswers(prev => [...prev, {
      questionIndex: currentIndex,
      word: exercise.word,
      correctAnswer: exercise.word,
      userAnswer: null, // simplified for result tracking
      isCorrect: correct,
      timeSpent,
    }]);
    setCurrentIndex(prev => prev + 1);
  };

  const isComplete = currentIndex >= exercises.length && exercises.length > 0;

  // Submit results when complete
  useEffect(() => {
    if (!isComplete || phase !== 'active') return;
    setPhase('complete');

    const correctCount = answers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / answers.length) * 100);
    const totalTime = Date.now() - sessionStartRef.current;

    exerciseApi.submitResult({
      exerciseType: 'spelling',
      wordlistId: resolvedWordlistId || null,
      totalQuestions: exercises.length,
      correctAnswers: correctCount,
      score,
      totalTimeSpent: totalTime,
      answers,
    }).then(result => {
      if (result.newAchievements && result.newAchievements.length > 0) {
        showAchievements(result.newAchievements);
      }
    }).catch(err => console.error('Failed to save spelling results:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col">
        <header className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{t('spelling')}</h1>
          </div>
        </header>
        <div className="flex-1 flex items-start justify-center p-4 pt-8">
          <SpellingSetup onStart={handleStart} />
        </div>
      </div>
    );
  }

  if (error || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-sm w-full"
        >
          <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('noExercises')}</h2>
          <p className="text-gray-500 mb-6">{t('noSpellingMessage')}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            {t('backToDashboard')}
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'complete') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-lg text-center max-w-sm w-full"
        >
          <div className="text-5xl mb-4">{correctCount === exercises.length ? '\u{1F3C6}' : '\u{270D}\u{FE0F}'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('sessionComplete')}</h2>
          <p className="text-lg text-gray-600 mb-6">
            {t('score', { correct: correctCount, total: exercises.length })}
          </p>

          {/* Missed words */}
          {answers.some(a => !a.isCorrect) && (
            <div className="mb-6 text-left">
              <p className="text-sm font-semibold text-gray-500 mb-2">{t('misspelledWords')}</p>
              <div className="flex flex-wrap gap-2">
                {answers.filter(a => !a.isCorrect).map(a => (
                  <span key={a.word} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                    {a.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPhase('setup'); setExercises([]); }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {t('tryAgain')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              {t('backToDashboard')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{t('spelling')}</h1>
          <span className="ml-auto text-sm text-gray-500">
            {currentIndex + 1} / {exercises.length}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-lg mx-auto w-full px-4 pt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300 rounded-full"
            style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <SpellingCard
              key={currentIndex}
              exercise={exercises[currentIndex]}
              mode={mode}
              onResult={handleResult}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
