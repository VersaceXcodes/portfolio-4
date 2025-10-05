module.exports = {
  "testEnvironment": "node",
  "roots": [
    "<rootDir>/tests"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/tests/setup.ts"
  ],
  "moduleFileExtensions": [
    "js",
    "ts"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testMatch": [
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  "collectCoverageFrom": [
    "<rootDir>/src/**/*.{js,ts}"
  ],
  "coverageDirectory": "<rootDir>/coverage",
  "coverageReporters": [
    "json",
    "lcov",
    "text",
    "clover"
  ],
  "preset": "ts-jest"
};