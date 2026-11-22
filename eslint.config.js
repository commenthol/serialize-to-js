'use strict'

module.exports = [
  {
    ignores: ['coverage/**', 'tmp/**', 'lib/**']
  },
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs'
    },
    rules: {
      'key-spacing': 'off',
      'no-console': 'warn',
      'no-unused-vars': ['error', { args: 'none' }]
    }
  }
]
