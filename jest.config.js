module.exports = {
  // The root of your source code
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  
  // Test match pattern
  testMatch: ['**/__tests__/**/*.test.js'],
  
  // Test environment
  testEnvironment: 'node',
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**'
  ],
  
  // Coverage threshold settings
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mock calls and instances between tests
  clearMocks: true,
  
  // Mock file resolution pattern
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}; 