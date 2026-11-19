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

      // TypeScript typechecking is the source of truth for TypeScript-specific diagnostics.
      // Do not reference @typescript-eslint rules until that plugin is an installed dependency.
      'no-unused-vars': 'off',

      // React 19 / Next.js modern JSX standards
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',

      // Allow empty catch blocks during rapid ecosystem expansion — but flag genuinely
      // empty function bodies elsewhere, since those usually mean unfinished logic.
      'no-empty': ['error', { allowEmptyCatch: true }],

      // --- ADDITIONAL STRICTNESS, matching the tsconfig/next.config philosophy ---
      // Catches `==`/`!=` where `===`/`!==` was almost certainly intended.
      eqeqeq: ['warn', 'smart'],
      // Flags `let` that's never reassigned — cheap correctness signal.
      'prefer-const': 'warn',
    },
  },
]);

export default eslintConfig;