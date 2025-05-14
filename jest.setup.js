/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  testMatch: ['<rootDir>/test/**/*.[jt]s?(x)', '<rootDir>/test/?(*.)+(test|spec).[tj]s?(x)'],
  extensionsToTreatAsEsm: ['.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};