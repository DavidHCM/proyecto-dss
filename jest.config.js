module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalTeardown: './jest-teardown.js',
    testMatch: ['**/tests/**/*.test.ts'],
};
