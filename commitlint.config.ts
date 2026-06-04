import type { UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional', 'gitmoji'],
  rules: {
    'scope-empty': [2, 'never'],
  },
}

export default Configuration
