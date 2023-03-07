import type { Mock } from 'vitest';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getLogger } from '../util/logger';
import { ConfigStore } from './cfgStore';
import { getGlobalConfigPath, getRawGlobalSettings, writeRawGlobalSettings } from './GlobalSettings';

interface MockConfigStore extends ConfigStore {
    (name: string): MockConfigStore;
    all: unknown;
    path: string;
    size: number;
    set: (v: unknown) => void;
    has(k: string): boolean;
    get(k: string): unknown;
    delete(k: string): void;
    clear(): void;
    mock_getAll: Mock<[], unknown>;
    mock_setAll: Mock<[v: unknown], unknown>;
    mock_getPath: Mock<[], string>;
}

function createMockConfigStore() {
    let _all: unknown = undefined;
    let _name = 'name';
    let _path = 'path';

    const mock_getAll = vi.fn(() => _all);
    const mock_setAll = vi.fn((v) => (_all = v));
    const mock_getPath = vi.fn(() => _path);

    const store: MockConfigStore = vi.fn((name) => {
        _name = name;
        _path = `/User/HOME/.config/${name}.json`;
    }) as unknown as MockConfigStore;
    store.prototype.set = mock_setAll;
    Object.defineProperty(store, 'all', {
        get: mock_getAll,
        set: mock_setAll,
    });
    Object.defineProperty(store, 'path', {
        get: mock_getPath,
    });
    Object.defineProperty(store, 'mock_getAll', { value: mock_getAll });
    Object.defineProperty(store, 'mock_setAll', { value: mock_setAll });
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

    test('getRawGlobalSettings', () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const path = getGlobalConfigPath();
        const s = getRawGlobalSettings();
        expect(s).toEqual({
            source: {
                name: 'CSpell Configstore',
                filename: undefined,
            },
        });
        // mockSetData('version', '0.2.0');
        const s2 = getRawGlobalSettings();
        expect(s2).toEqual({
            version: '0.2.0',
            source: {
                name: 'CSpell Configstore',
                filename: path,
            },
        });
        expect(mockLog).not.toHaveBeenCalled();
    });

    test('getRawGlobalSettings with Error', () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const s = getRawGlobalSettings();
        expect(s).toEqual({
            source: {
                name: 'CSpell Configstore',
                filename: undefined,
            },
        });
        expect(mockError).toHaveBeenCalledWith(expect.any(Error));
    });

    test('writeRawGlobalSettings', () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const s = getRawGlobalSettings();
        const updated = { ...s, import: ['hello'], extra: { name: 'extra', value: 'ok' } };
        writeRawGlobalSettings(updated);
        expect(mockImpl.mock_setAll).toHaveBeenCalledWith({
            import: ['hello'],
        });
    });

    test('writeRawGlobalSettings with Error', () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        const updated = { import: ['hello'] };
        mockImpl.mock_setAll.mockImplementation(() => {
            throw new Error('fail');
        });
        const error1 = writeRawGlobalSettings(updated);
        expect(error1).toBeInstanceOf(Error);
        mockImpl.mock_setAll.mockImplementation(() => {
            throw 'fail';
        });
        const error2 = writeRawGlobalSettings(updated);
        expect(error2).toBeInstanceOf(Error);
    });

    test('No Access to global settings files', () => {
        const mockImpl = createMockConfigStore();
        mockConfigstore.mockImplementation(mockImpl);
        mockImpl.mock_getAll.mockImplementation(() => {
            throw new SystemLikeError('permission denied', 'EACCES');
        });
        const s = getRawGlobalSettings();
        expect(mockError).toHaveBeenCalledTimes(0);
        expect(mockLog).toHaveBeenCalledTimes(0);
        expect(s).toEqual({
            source: {
                name: 'CSpell Configstore',
                filename: undefined,
            },
        });
    });
});

class SystemLikeError extends Error {
    constructor(msg: string, readonly code: string) {
        super(msg);
    }
}
