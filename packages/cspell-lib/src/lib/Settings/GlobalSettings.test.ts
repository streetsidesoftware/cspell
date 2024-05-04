import fs from 'node:fs/promises';

import { CSpellConfigFileInMemory, CSpellConfigFileJson } from 'cspell-config-lib';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
    getGlobalConfig,
    getGlobalConfigPath,
    getRawGlobalSettings,
    writeRawGlobalSettings,
} from './GlobalSettings.js';

const fsData = new Map<string, string>();

vi.mock('node:fs/promises', async (_importOriginal) => ({
    // default: (await _importOriginal<{ default: object }>()).default,
    default: {
        readFile: vi.fn(async (filename) => fsData.get(filename)),
        writeFile: vi.fn(async (filename, data) => fsData.set(filename, data)),
        mkdir: vi.fn(async () => undefined),
    },
}));

const oc = expect.objectContaining;

describe('Validate GlobalSettings', () => {
    beforeEach(() => {});

    afterEach(() => {
        fsData.clear();
        vi.restoreAllMocks();
    });

    test('getGlobalConfigPath', () => {
        // console.warn('%o', Configstore);
        expect(getGlobalConfigPath()).toEqual(expect.stringMatching(/cspell\.json$/));
    });

    test('getRawGlobalSettings', async () => {
        const s = getRawGlobalSettings();
        await expect(s).resolves.toEqual(
            oc({
                source: oc({
                    name: 'CSpell Configstore',
                }),
            }),
        );
    });

    test('writeRawGlobalSettings', async () => {
        const s = await getRawGlobalSettings();
        const updated = { ...s, import: ['hello'], extra: { name: 'extra', value: 'ok' } };
        await writeRawGlobalSettings(updated);
        expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(expect.any(String), stringify({ import: ['hello'] }));
    });

    test('writeRawGlobalSettings then read', async () => {
        const cfBefore = await getGlobalConfig();

        expect(cfBefore).toBeInstanceOf(CSpellConfigFileInMemory);

        const updated = { import: ['hello'], extra: { name: 'extra', value: 'ok' } };
        await writeRawGlobalSettings(updated);

        const cfAfter = await getGlobalConfig();
        expect(cfAfter).toBeInstanceOf(CSpellConfigFileJson);
        expect(cfAfter.settings.import).toEqual(['hello']);
    });
});

function stringify(obj: object) {
    return JSON.stringify(obj, undefined, 2) + '\n';
}
