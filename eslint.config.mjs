import babelParser from '@babel/eslint-parser';
import globals from 'globals'; // Import the globals package
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactNativePlugin from 'eslint-plugin-react-native';
import reactHooksPlugin from 'eslint-plugin-react-hooks'; // Import the react-hooks plugin

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true,
        },
        babelOptions: {
          babelrc: true,
          configFile: true,
          presets: ['@babel/preset-react', '@babel/preset-env'],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: 'readonly',
        ReactNative: 'readonly',
        __DEV__: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      'react-native': reactNativePlugin,
      'react-hooks': reactHooksPlugin, // Use the imported plugin here
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.json'],
        },
      },
      'import/ignore': ['react-native'],
      react: {
        version: 'detect',
      },
    },
    rules: {
      'semi': ['error', 'always'],
      // 'no-unused-vars': 'error',
      'no-console': 'warn',
      'import/no-unresolved': ['error', { commonjs: true, amd: true }],
      'import/named': 'warn',
      'import/default': 'warn',
      'import/namespace': 'warn',
      'import/no-absolute-path': 'error',
      'import/no-self-import': 'error',
      'import/no-cycle': 'warn',
      'import/no-useless-path-segments': 'error',
      'import/no-duplicates': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      // 'react/prop-types': 'warn',
      // 'react/no-unescaped-entities': 'error',
      'react/no-direct-mutation-state': 'error',
      'react-native/no-unused-styles': 'error',
      // 'react-native/no-inline-styles': 'warn',
      // 'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': ['warn', { skip: ['Button', 'Text'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      'build/**',
      'dist/**',
      'ios/**',
      'android/**',
      '.expo/**',
      'metro.config.js',
      'babel.config.js',
      'tailwind.config.js',
      'index.js',
      'app.json',
      '**/*.config.js',
      '**/*.lock',
    ],
  },
];