import path from 'path';
import type { Mock } from 'vitest';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getLogger } from '../util/logger.js';
import { ConfigStore } from './cfgStore.js';
import { getGlobalConfigPath, getRawGlobalSettings, writeRawGlobalSettings } from './GlobalSettings.js';

interface MockConfigStore extends ConfigStore {
    (name: string): MockConfigStore;
    all: unknown;
    path: string;
    size: number;
    set(v: Record<string, unknown>): void;
    set(k: string, v: unknown): void;
    has(k: string): boolean;
    get(k: string): unknown;
    delete(k: string): void;
    clear(): void;
    mock_getAll: Mock<[], unknown>;
    mock_setAll: Mock<[v: unknown], unknown>;
    mock_getPath: Mock<[], string>;
}

const oc = expect.objectContaining;

function createMockConfigStore() {
    let _all: Record<string, unknown> | undefined = undefined;
    let _path = 'path';

    const mock_getAll = vi.fn(() => _all);
    const mock_set = vi.fn((vk: string | Record<string, unknown>, v?: unknown) => {
        if (typeof vk === 'string') {
            (_all = _all || {})[vk] = v;
            return _all;
        }
        _all = vk;
        return _all;
    });
    const mock_getPath = vi.fn(() => {
        return _path;
    });

    const store: MockConfigStore = vi.fn((id) => {
        _path = path.resolve(`/User/local/data/.config/configstore/${id}.json`);
        return store;
    }) as unknown as MockConfigStore;
    store.set = mock_set;
    Object.defineProperty(store, 'all', {
        get: mock_getAll,
        set: mock_set,
    });
    Object.defineProperty(store, 'path', {
        get: mock_getPath,
    });
    Object.defineProperty(store, 'mock_getAll', { value: mock_getAll });
    Object.defineProperty(store, 'mock_setAll', { value: mock_set });
    Object.defineProperty(store, 'mock_getPath', { value: mock_getPath });

    return store;
}

vi.mock('./cfgStore');

const logger = getLogger();
const mockLog = vi.spyOn(logger, 'log').mockImplementation(() => undefined);
const mockError = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
const mockConfigstore = vi.mocked(ConfigStore);

describe('Validate GlobalSettings', () => {
    afterEach(() => {
        mockConfigstore.mockClear();
        mockLog.mockClear();
        mockError.mockClear();
    });

    test('getGlobalConfigPath', () => {
        // console.warn('%o', Configstore);
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        expect(getGlobalConfigPath()).toEqual(expect.stringMatching(/cspell\.json$/));
    });

    test('getRawGlobalSettings', async () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const path = getGlobalConfigPath();
        const s = getRawGlobalSettings();
        await expect(s).resolves.toEqual(
            oc({
                source: oc({
                    name: 'CSpell Configstore',
                }),
            }),
        );
        mockImpl.set('version', '0.2.0');
        const s2 = getRawGlobalSettings();
        await expect(s2).resolves.toEqual(
            oc({
                version: '0.2.0',
                source: oc({
                    name: 'CSpell Configstore',
                    filename: path,
                }),
            }),
        );
        expect(mockLog).not.toHaveBeenCalled();
    });

    test('getRawGlobalSettings with Error', async () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        mockImpl.mock_getAll.mockImplementation(() => {
            throw new Error('fail');
        });
        const s = getRawGlobalSettings();
        await expect(s).resolves.toEqual(
            oc({
                import: [],
                source: oc({
                    name: 'CSpell Configstore',
                }),
            }),
        );
        expect(mockError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('writeRawGlobalSettings', async () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const s = await getRawGlobalSettings();
        const updated = { ...s, import: ['hello'], extra: { name: 'extra', value: 'ok' } };
        await writeRawGlobalSettings(updated);
        expect(mockImpl.mock_setAll).toHaveBeenCalledWith({
            import: ['hello'],
        });
    });

    test('writeRawGlobalSettings with Error', async () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const updated = { import: ['hello'] };
        const mockSet = vi.mocked(mockImpl.set);
        mockSet.mockImplementation(() => {
            throw new Error('fail');
        });
        const error1 = writeRawGlobalSettings(updated);
        await expect(error1).rejects.toBeInstanceOf(Error);
    });

    test('No Access to global settings files', async () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        mockImpl.mock_getAll.mockImplementation(() => {
            throw new SystemLikeError('permission denied', 'EACCES');
        });
        const s = getRawGlobalSettings();
        await expect(s).resolves.toEqual(
            oc({
                import: [],
                source: oc({
                    name: 'CSpell Configstore',
                }),
            }),
        );
        expect(mockError).toHaveBeenCalledTimes(0);
        expect(mockLog).toHaveBeenCalledTimes(0);
    });
});

class SystemLikeError extends Error {
    constructor(
        msg: string,
        readonly code: string,
    ) {
        super(msg);
    }
}
