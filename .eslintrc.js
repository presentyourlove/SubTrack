module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native-a11y/all',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native', 'prettier'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  env: {
    'react-native/react-native': true,
    jest: true,
  },
  overrides: [
    {
      files: ['jest.config.js', 'jest.setup.js', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react/display-name': 'off',
      },
    },
  ],
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react-native-a11y/has-accessibility-hint': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '.eslintrc.js',
    'babel.config.js',
    'jest.config.js',
    'jest.setup.js',
    '__mocks__',
    'coverage',
    'scripts',
  ],
};
