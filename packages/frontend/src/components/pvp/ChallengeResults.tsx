import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Frown, Minus, Loader2, RotateCcw, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { TopBar } from '../layout/TopBar';
import { pvpApi } from '../../services/api/pvpApi';
import { useAuth } from '../../contexts/AuthContext';
import type { PvpChallenge } from '../../services/api/pvpApi';

interface ComparisonData {
  questions: Array<{ index: number; word: string; correctAnswer: string; options: string[] }>;
  challengerAnswers: Array<{ question_index: number; word: string; correct_answer: string; selected_answer: string | null; is_correct: number }>;
  opponentAnswers: Array<{ question_index: number; word: string; correct_answer: string; selected_answer: string | null; is_correct: number }>;
  challenger: { id: number; username: string; displayName: string | null; score: number | null };
  opponent: { id: number; username: string; displayName: string | null; score: number | null };
}

export function ChallengeResults() {
  const { t } = useTranslation('pvp');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state: authState } = useAuth();
  const userId = authState.user?.id;

  const [challenge, setChallenge] = useState<PvpChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [rematchLoading, setRematchLoading] = useState(false);

  useEffect(() => {
    pvpApi.getChallenge(Number(id))
      .then(data => {
        setChallenge(data.challenge);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleToggleComparison = async () => {
    if (showComparison) {
      setShowComparison(false);
      return;
    }

    if (!comparison) {
      setLoadingComparison(true);
      try {
        const data = await pvpApi.getQuestionComparison(Number(id));
        setComparison(data);
      } catch {
        // silently fail
      } finally {
        setLoadingComparison(false);
      }
    }
    setShowComparison(true);
  };

  const handleRematch = async () => {
    setRematchLoading(true);
    try {
      const { challenge: newChallenge } = await pvpApi.createRematch(Number(id));
      navigate(`/pvp/${newChallenge.id}/play`);
    } catch {
      setRematchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F9FF]">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#F0F9FF]">
        <TopBar title={t('resultsTitle')} onBack={() => navigate('/pvp')} />
        <p className="text-center pt-12 text-gray-500">Challenge not found</p>
      </div>
    );
  }

  const isCompleted = challenge.status === 'completed';
  const isWaiting = challenge.status === 'active';
  const isDraw = isCompleted && challenge.winner_id === null;
  const isWinner = isCompleted && challenge.winner_id === userId;

  const myScore = challenge.challenger_id === userId ? challenge.challenger_score : challenge.opponent_score;
  const opponentScore = challenge.challenger_id === userId ? challenge.opponent_score : challenge.challenger_score;
  const opponentName = challenge.challenger_id === userId
    ? (challenge.opponent_display_name || challenge.opponent_username)
    : (challenge.challenger_display_name || challenge.challenger_username);

  const resultIcon = isDraw ? Minus : isWinner ? Trophy : Frown;
  const ResultIcon = resultIcon;
  const resultBg = isDraw ? 'from-yellow-400 to-amber-500' : isWinner ? 'from-green-400 to-emerald-500' : 'from-red-400 to-rose-500';
  const resultText = isDraw ? t('drawResult') : isWinner ? t('winner') : t('loser');

  return (
    <div className="min-h-screen bg-[#F0F9FF] background-pattern">
      <TopBar
        title={t('resultsTitle')}
        onBack={() => navigate('/pvp')}
      />

      <main className="max-w-xl mx-auto px-4 pt-6 pb-20">
        {isWaiting ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-yellow-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">{t('waiting')}</h2>
            <p className="text-gray-500 text-sm">
              {myScore !== null && `${t('yourScore')}: ${myScore}`}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Result header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-gradient-to-br ${resultBg} rounded-3xl p-8 text-center text-white mb-6 shadow-lg`}
            >
              <ResultIcon size={48} className="mx-auto mb-3 drop-shadow-md" />
              <h2 className="text-2xl font-black mb-1">{resultText}</h2>
              <p className="text-white/80 text-sm">{t('vs')} {opponentName}</p>
            </motion.div>

            {/* Score comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6"
            >
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t('you')}</p>
                  <p className={`text-4xl font-black ${isWinner ? 'text-green-500' : isDraw ? 'text-yellow-500' : 'text-gray-700'}`}>
                    {myScore ?? '-'}
                  </p>
                </div>
                <div className="text-3xl font-black text-gray-200">-</div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">{opponentName}</p>
                  <p className={`text-4xl font-black ${!isWinner && !isDraw ? 'text-green-500' : isDraw ? 'text-yellow-500' : 'text-gray-700'}`}>
                    {opponentScore ?? '-'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Wordlist info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6"
            >
              <p className="text-sm text-gray-500">
                {t('wordlist', { name: challenge.wordlist_name })} · {challenge.question_count} {t('questionCount').toLowerCase()}
              </p>
            </motion.div>

            {/* Question comparison toggle */}
            {isCompleted && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={handleToggleComparison}
                className="w-full mb-4 py-3 rounded-2xl bg-white border-2 border-indigo-200 text-indigo-700 font-bold cursor-pointer hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
              >
                {loadingComparison ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : showComparison ? (
                  <><ChevronUp size={16} />{t('hideComparison', 'Hide Details')}</>
                ) : (
                  <><ChevronDown size={16} />{t('showComparison', 'View Question Details')}</>
                )}
              </motion.button>
            )}

            {/* Question comparison */}
            <AnimatePresence>
              {showComparison && comparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 mb-6"
                >
                  {comparison.questions.map((q, i) => {
                    const iAmChallenger = challenge.challenger_id === userId;
                    const myAns = iAmChallenger
                      ? comparison.challengerAnswers.find(a => a.question_index === i)
                      : comparison.opponentAnswers.find(a => a.question_index === i);
                    const theirAns = iAmChallenger
                      ? comparison.opponentAnswers.find(a => a.question_index === i)
                      : comparison.challengerAnswers.find(a => a.question_index === i);

                    return (
                      <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-sm font-bold text-gray-800 mb-2">
                          {i + 1}. {q.word}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{q.correctAnswer}</p>
                        <div className="flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            {myAns?.is_correct ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <X size={14} className="text-red-500" />
                            )}
                            <span className="text-gray-600">{t('you')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {theirAns?.is_correct ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <X size={14} className="text-red-500" />
                            )}
                            <span className="text-gray-600">{opponentName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isCompleted && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={handleRematch}
              disabled={rematchLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold cursor-pointer hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {rematchLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <><RotateCcw size={16} />{t('rematch', 'Rematch')}</>
              )}
            </motion.button>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            onClick={() => navigate('/pvp')}
            className="w-full py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {t('backToList')}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
