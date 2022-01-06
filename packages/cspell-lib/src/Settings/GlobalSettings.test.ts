import Configstore from 'configstore';
import { getLogger } from '../util/logger';
// eslint-disable-next-line jest/no-mocks-import
import {
    clearData as clearConfigstore,
    // setData as setConfigstore,
    clearMocks,
    mockAll,
    mockSetData,
} from '../__mocks__/configstore';
import { getGlobalConfigPath, getRawGlobalSettings, writeRawGlobalSettings } from './GlobalSettings';

const logger = getLogger();
const mockLog = jest.spyOn(logger, 'log').mockImplementation();
const mockError = jest.spyOn(logger, 'error').mockImplementation();
const mockConfigstore = jest.mocked(Configstore, true);

describe('Validate GlobalSettings', () => {
    beforeEach(() => {
        mockConfigstore.mockClear();
        mockLog.mockClear();
        mockError.mockClear();
        mockAll.mockClear();
        clearMocks();
        clearConfigstore();
    });

    test('getGlobalConfigPath', () => {
        expect(getGlobalConfigPath()).toEqual(expect.stringMatching(/cspell\.json$/));
    });

    test('getRawGlobalSettings', () => {
        const path = getGlobalConfigPath();
        const s = getRawGlobalSettings();
        expect(s).toEqual({
            source: {
                name: 'CSpell Configstore',
                filename: undefined,
            },
        });
        mockSetData('version', '0.2.0');
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
        mockAll.mockImplementation(() => {
            throw new Error('fail');
        });
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
        const s = getRawGlobalSettings();
        const updated = { ...s, import: ['hello'], extra: { name: 'extra', value: 'ok' } };
        writeRawGlobalSettings(updated);
        expect(mockSetData).toHaveBeenCalledWith({
            import: ['hello'],
        });
    });

    test('writeRawGlobalSettings with Error', () => {
        const updated = { import: ['hello'] };
        mockSetData.mockImplementation(() => {
            throw new Error('fail');
        });
        const error1 = writeRawGlobalSettings(updated);
        expect(error1).toBeInstanceOf(Error);
        mockSetData.mockImplementation(() => {
            throw 'fail';
        });
        const error2 = writeRawGlobalSettings(updated);
        expect(error2).toBeInstanceOf(Error);
    });

    test('No Access to global settings files', () => {
        mockAll.mockImplementation(() => {
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
