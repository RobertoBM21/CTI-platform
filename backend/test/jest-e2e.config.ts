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
};

export default config;
