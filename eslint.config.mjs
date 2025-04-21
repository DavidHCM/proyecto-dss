import globals from 'globals';
import tseslint from 'typescript-eslint';
import noSecrets from 'eslint-plugin-no-secrets';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: globals.node,
    },
    plugins: {
      'no-secrets': noSecrets,
    },
    rules: {
      'semi': ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'eqeqeq': ['error', 'always'],
      'curly': 'error',
      'no-secrets/no-secrets': ['error', { tolerance: 4 }],
    },
  },
  {
    files: ['**/*.ts'],
    ...tseslint.configs.recommended[0],
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },
];
