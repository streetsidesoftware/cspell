import fs from 'node:fs/promises';
import path from 'node:path';

import ConfigStoreExport from 'configstore';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { defaultConfigFileName, GlobalConfigStore, legacyLocationDir } from './cfgStore.js';

const fsData = new Map<string, string>();

vi.mock('node:fs/promises', async (_importOriginal) => ({
    // default: (await _importOriginal<{ default: object }>()).default,
    default: {
        readFile: vi.fn(async (filename) => fsData.get(filename)),
        writeFile: vi.fn(async (filename, data) => fsData.set(filename, data)),
        mkdir: vi.fn(async () => undefined),
    },
}));

const sc = expect.stringContaining;
const oc = expect.objectContaining;

describe('GlobalConfigStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        fsData.clear();
        vi.restoreAllMocks();
    });

    test('GlobalConfigStore', () => {
        expect(GlobalConfigStore.defaultLocation).toEqual(sc('cspell.json'));
    });

    test('legacyLocation', () => {
        const configStoreLocation = new ConfigStoreExport('cspell').path;
        const legacyLocation = path.join(legacyLocationDir || '', defaultConfigFileName);
        expect(legacyLocation).toBe(configStoreLocation);
    });

    test('readConfigFile found', async () => {
        fsData.set(GlobalConfigStore.defaultLocation, JSON.stringify({ imports: [] }));

        const cfgStore = GlobalConfigStore.create();
        const cfg = await cfgStore.readConfigFile();
        expect(cfg).toEqual(oc({ filename: sc(defaultConfigFileName), config: { imports: [] } }));
    });

    test('readConfigFile not found', async () => {
        const mockedFsReadFile = vi.mocked(fs.readFile);
        mockedFsReadFile.mockImplementation(async () => {
            throw new Error();
        });

        const cfgStore = GlobalConfigStore.create();
        const cfg = await cfgStore.readConfigFile();
        expect(cfg).toEqual(undefined);
    });

    test('writeConfigFile', async () => {
        const mockedFsWriteFile = vi.mocked(fs.writeFile);
        const mockedFsMkdir = vi.mocked(fs.mkdir);

        const cfgStore = GlobalConfigStore.create();
        const data = { name: 'cfg' };
        await cfgStore.writeConfigFile(data);
        expect(mockedFsMkdir).toHaveBeenCalled();
        expect(mockedFsWriteFile).toHaveBeenCalledWith(
            sc(defaultConfigFileName),
            JSON.stringify(data, undefined, 2) + '\n',
        );

        const cfg = await cfgStore.readConfigFile();
        expect(mockedFsMkdir).toHaveBeenCalled();
        expect(cfg).toEqual(oc({ filename: cfgStore.location, config: data }));
    });
});
