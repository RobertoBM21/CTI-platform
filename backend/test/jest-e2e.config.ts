import type { Config } from 'jest';

const config: Config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '..',
    testRegex: '.e2e-spec.ts$',
    transform: {
        '^.+\\.ts$': [
            '@swc/jest',
            {
                jsc: {
                    parser: { syntax: 'typescript', decorators: true },
                    transform: { decoratorMetadata: true },
                    target: 'es2022',
                },
            },
        ],
    },
    testEnvironment: 'node',
    testTimeout: 30000,
    //! Important: temporary solution until we refactor tests to properly close DB connections and allow parallel execution.
    // Run suites sequentially: prevents race conditions when multiple suites
    // overwrite process.env.MONGODB_URI in parallel workers.
    maxWorkers: 1,
    // Force Jest to exit after all tests complete, even if open handles remain
    // (e.g. Mongoose connections not fully closed by the time afterAll resolves).
    forceExit: true,
};

export default config;
