import * as path from 'node:path';

import { searchForConfig } from 'cspell-lib';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { environmentKeys } from '../environment.js';
import { pathPackageRoot } from '../test/test.helper.js';
import { readConfig } from '../util/configFileHelper.js';

const root = pathPackageRoot;
const samples = path.resolve(root, 'samples');
const environmentSamples = path.resolve(samples, 'environment_config');

const j = path.join;

vi.mock('cspell-lib', async (importOriginal) => {
    const cspellLib = await importOriginal<typeof import('cspell-lib')>();

    return {
        ...cspellLib,
        searchForConfig: vi.fn(cspellLib.searchForConfig),
    };
});

describe('Config File Helper', () => {
    afterEach(() => {
        delete process.env[environmentKeys.CSPELL_CONFIG_PATH];
        delete process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH];
    });

    test('uses CSPELL_CONFIG_PATH as fallback when config not provided', async () => {
        const customConfig = j(environmentSamples, 'cspell.custom.json');
        process.env[environmentKeys.CSPELL_CONFIG_PATH] = customConfig;

        const result = await readConfig(undefined, environmentSamples);

        expect(result.source).toBe(customConfig);
    });

    test('falls back to CSPELL_DEFAULT_CONFIG_PATH when no config is set', async () => {
        const defaultConfig = j(environmentSamples, 'cspell.default.json');

        process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH] = defaultConfig;

        vi.mocked(searchForConfig).mockImplementationOnce(async () => undefined);

        const result = await readConfig(undefined, environmentSamples);

        expect(result.source).toBe(defaultConfig);
    });

    test('throws an error when the specified config file does not exist', async () => {
        const rootConfig = j(environmentSamples, 'nonexistent.json');

        process.env[environmentKeys.CSPELL_CONFIG_PATH] = rootConfig;

        const readConfigResult = await readConfig(undefined, environmentSamples);
        expect(readConfigResult.source).toBe(rootConfig);
    });

    test('handles malformed config file gracefully', async () => {
        const malformedPath = j(samples, 'cspell-bad.json');
        process.env[environmentKeys.CSPELL_CONFIG_PATH] = malformedPath;
        process.env[environmentKeys.CSPELL_DEFAULT_CONFIG_PATH] = malformedPath;

        const result = await readConfig(undefined, samples);
        const resultConfig = result.config;

        expect(result.source).toBe(malformedPath);
        expect(resultConfig).toHaveProperty('id', 'Invalid JSON');
        expect(resultConfig).toHaveProperty('name', 'Trailing comma');
        expect(resultConfig).toHaveProperty('__importRef');
    });
});
