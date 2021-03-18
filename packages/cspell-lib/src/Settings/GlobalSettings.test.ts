import { getGlobalConfigPath, getRawGlobalSettings, writeRawGlobalSettings } from './GlobalSettings';
import Configstore from 'configstore';
// eslint-disable-next-line jest/no-mocks-import
import {
    clearData as clearConfigstore,
    // setData as setConfigstore,
    clearMocks,
    mockAll,
    mockSetData,
} from '../__mocks__/configstore';

const mockLog = jest.fn();
console.log = mockLog;
jest.mock('configstore');

const mockConfigstore = Configstore as jest.Mock<Configstore>;

describe('Validate GlobalSettings', () => {
    beforeEach(() => {
        mockConfigstore.mockClear();
        mockLog.mockClear();
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
        expect(mockLog).toHaveBeenCalledWith(expect.any(Error));
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
});
