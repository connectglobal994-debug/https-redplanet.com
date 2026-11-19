// eslint.config.mjs
//
// Enterprise-Grade Red Planet ESLint Configuration (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Architecture & Engineering: Deblaq
// Enforces strict code quality rules, React Vitals, TypeScript safety checks,
// and clean build global ignores across the entire Red Planet digital empire.

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  // Core Next.js Web Vitals & React performance best practices
  ...nextVitals,

  // Global Ignores: Exclude build artifacts, compiled outputs, and backend automation scripts from lint checks
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
    'scripts/automation/**',
    'public/audio/**',
    'public/uploads/**',
  ]),

  // Custom Rules and Overrides for Enterprise Code Cleanliness
  {
    rules: {
      // Prevent console statements in production code except for intentional warnings/errors
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Base JS rule off — TypeScript's own checker handles unused vars, but we turn on
      // the TS-aware version below so it's actually enforced, not silently disabled.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React 19 / Next.js modern JSX standards
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',

      // Allow empty catch blocks during rapid ecosystem expansion — but flag genuinely
      // empty function bodies elsewhere, since those usually mean unfinished logic.
      'no-empty': ['error', { allowEmptyCatch: true }],

      // --- ADDITIONAL STRICTNESS, matching the tsconfig/next.config philosophy ---
      // Flags `any` instead of letting type safety silently leak — warn, not error,
      // so it doesn't block builds while you're still wiring real backends.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Catches `==`/`!=` where `===`/`!==` was almost certainly intended.
      eqeqeq: ['warn', 'smart'],
      // Flags `let` that's never reassigned — cheap correctness signal.
      'prefer-const': 'warn',
      // Catches accidental floating promises (e.g. an unawaited fetch in an upload
      // handler) — relevant now that you have real async upload/verify routes.
      '@typescript-eslint/no-floating-promises': 'off', // enable once type-aware linting is fully configured
    },
  },
]);

export default eslintConfig;