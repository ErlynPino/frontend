import type { Config } from 'jest';

const config: Config = {
  displayName: 'frontend',
  preset: 'jest-preset-angular',
  setupFiles: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@primeng|@primeuix|primeng|primeicons)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.routes.ts',
    '!src/main.ts',
    '!src/app/app.config.ts',
  ],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;
