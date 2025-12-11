module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // collectCoverage: true,
  // coverageDirectory: '<rootDir>/coverage'
}