export default [
  {
    ignores: ['coverage/**', 'tmp/**', 'lib/**']
  },
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'key-spacing': 'off',
      'no-console': 'warn',
      'no-unused-vars': ['error', { args: 'none' }]
    }
  }
]
