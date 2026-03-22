import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, FileText } from 'lucide-react';

interface SpellingSetupProps {
  onStart: (config: { mode: 'definition' | 'fill_blank'; questionCount: number }) => void;
}

export function SpellingSetup({ onStart }: SpellingSetupProps) {
  const { t } = useTranslation('exercises');
  const [mode, setMode] = useState<'definition' | 'fill_blank'>('definition');
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">{t('spellingSetup')}</h2>

      {/* Mode selection */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 mb-3 block">{t('spellingMode')}</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('definition')}
            className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
              mode === 'definition'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <BookOpen className={`w-6 h-6 mx-auto mb-2 ${mode === 'definition' ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${mode === 'definition' ? 'text-emerald-700' : 'text-gray-600'}`}>
              {t('definitionMode')}
            </span>
          </button>
          <button
            onClick={() => setMode('fill_blank')}
            className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
              mode === 'fill_blank'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText className={`w-6 h-6 mx-auto mb-2 ${mode === 'fill_blank' ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${mode === 'fill_blank' ? 'text-emerald-700' : 'text-gray-600'}`}>
              {t('fillBlankMode')}
            </span>
          </button>
        </div>
      </div>

      {/* Question count */}
      <div className="mb-8">
        <label className="text-sm font-semibold text-gray-600 mb-3 block">{t('questionCount')}</label>
        <div className="flex gap-2">
          {[5, 10, 15, 20].map(count => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                questionCount === count
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart({ mode, questionCount })}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
      >
        {t('startSpelling')}
      </button>
    </motion.div>
  );
}
