import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.setup.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: ['node_modules/(?!(@mswjs/interceptors|msw|until-async)/)'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^until-async$': '<rootDir>/test/jest-shims/until-async.js',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
});