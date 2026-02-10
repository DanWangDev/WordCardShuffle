import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEn from './locales/en/common.json'
import authEn from './locales/en/auth.json'
import dashboardEn from './locales/en/dashboard.json'
import studyEn from './locales/en/study.json'
import quizEn from './locales/en/quiz.json'
import challengeEn from './locales/en/challenge.json'
import adminEn from './locales/en/admin.json'
import parentEn from './locales/en/parent.json'
import notificationsEn from './locales/en/notifications.json'
import linkingEn from './locales/en/linking.json'

import commonZh from './locales/zh-CN/common.json'
import authZh from './locales/zh-CN/auth.json'
import dashboardZh from './locales/zh-CN/dashboard.json'
import studyZh from './locales/zh-CN/study.json'
import quizZh from './locales/zh-CN/quiz.json'
import challengeZh from './locales/zh-CN/challenge.json'
import adminZh from './locales/zh-CN/admin.json'
import parentZh from './locales/zh-CN/parent.json'
import notificationsZh from './locales/zh-CN/notifications.json'
import linkingZh from './locales/zh-CN/linking.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        auth: authEn,
        dashboard: dashboardEn,
        study: studyEn,
        quiz: quizEn,
        challenge: challengeEn,
        admin: adminEn,
        parent: parentEn,
        notifications: notificationsEn,
        linking: linkingEn,
      },
      'zh-CN': {
        common: commonZh,
        auth: authZh,
        dashboard: dashboardZh,
        study: studyZh,
        quiz: quizZh,
        challenge: challengeZh,
        admin: adminZh,
        parent: parentZh,
        notifications: notificationsZh,
        linking: linkingZh,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'dashboard',
      'study',
      'quiz',
      'challenge',
      'admin',
      'parent',
      'notifications',
      'linking',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'vocab_master_language',
      caches: ['localStorage'],
    },
  })

export default i18n
