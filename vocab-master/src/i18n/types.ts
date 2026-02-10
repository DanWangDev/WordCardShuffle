import 'i18next'

import type commonEn from './locales/en/common.json'
import type authEn from './locales/en/auth.json'
import type dashboardEn from './locales/en/dashboard.json'
import type studyEn from './locales/en/study.json'
import type quizEn from './locales/en/quiz.json'
import type challengeEn from './locales/en/challenge.json'
import type adminEn from './locales/en/admin.json'
import type parentEn from './locales/en/parent.json'
import type notificationsEn from './locales/en/notifications.json'
import type linkingEn from './locales/en/linking.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof commonEn
      auth: typeof authEn
      dashboard: typeof dashboardEn
      study: typeof studyEn
      quiz: typeof quizEn
      challenge: typeof challengeEn
      admin: typeof adminEn
      parent: typeof parentEn
      notifications: typeof notificationsEn
      linking: typeof linkingEn
    }
  }
}
