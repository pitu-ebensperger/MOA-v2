const skipHttpTests = process.env.SKIP_HTTP_TESTS === 'true';

const httpTestIgnorePatterns = skipHttpTests
  ? [
      "/__tests__/.*routes.*\\.test\\.js$",
      "/__tests__/.*orderStock.*\\.test\\.js$",
      "/__tests__/.*admin.*\\.test\\.js$"
    ]
  : [];

export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.m?js$": ["babel-jest", { presets: ["@babel/preset-env"] }]
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/tests/**/*.test.js"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    ...httpTestIgnorePatterns
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "src/**/*.js",
    "routes/**/*.js",
    "!**/node_modules/**"
  ]
};
