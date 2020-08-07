module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: './coverage',
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  clearMocks: true
};
