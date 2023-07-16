import * as Path from 'path';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getRawGlobalSettings, writeRawGlobalSettings } from './GlobalSettings.js';
import { __testing__, addPathsToGlobalImports, listGlobalImports, removePathsFromGlobalImports } from './link.js';

vi.mock('./GlobalSettings');

const findPackageForCSpellConfig = __testing__.findPackageForCSpellConfig;

const mock_getRawGlobalSettings = vi.mocked(getRawGlobalSettings);
const mock_writeRawGlobalSettings = vi.mocked(writeRawGlobalSettings);

const configFileLocation = '/Users/home/.config/store';
const pathPython = require.resolve('@cspell/dict-python/cspell-ext.json');
const pathCpp = require.resolve('@cspell/dict-cpp/cspell-ext.json');
const pathHtml = require.resolve('@cspell/dict-html/cspell-ext.json');
const pathCss = require.resolve('@cspell/dict-css/cspell-ext.json');
const python = require.resolve('@cspell/dict-python/cspell-ext.json');

describe('Validate Link.ts', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test('listGlobalImports configstore empty', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            source: { filename: undefined, name: 'CSpell Configstore' },
        });
        const r = listGlobalImports();
        expect(r).toEqual({
            list: [],
            globalSettings: {
                source: { filename: undefined, name: 'CSpell Configstore' },
            },
        });
        expect(mock_getRawGlobalSettings).toHaveBeenCalledOnce();
        expect(mock_writeRawGlobalSettings).not.toHaveBeenCalled();
    });

    test('listGlobalImports configstore empty import', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            import: [],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });
        const r = listGlobalImports();
        expect(r).toEqual({
            list: [],
            globalSettings: {
                source: { filename: configFileLocation, name: 'CSpell Configstore' },
                import: [],
            },
        });
    });

    test('listGlobalImports with imports', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            import: [python],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });
        const r = listGlobalImports();
        expect(r).toEqual(
            expect.objectContaining({
                list: [
                    expect.objectContaining({
                        filename: python,
                        error: undefined,
                    }),
                ],
                globalSettings: expect.objectContaining({
                    source: { filename: configFileLocation, name: 'CSpell Configstore' },
                }),
            }),
        );
    });

    test('listGlobalImports with import errors', () => {
        const filename = '__not_found_file_.ext';
        mock_getRawGlobalSettings.mockReturnValue({
            import: [filename],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });
        const r = listGlobalImports();
        expect(r).toEqual(
            expect.objectContaining({
                list: [
                    expect.objectContaining({
                        filename: filename,
                        error: expect.stringContaining('Failed to read config'),
                    }),
                ],
                globalSettings: expect.objectContaining({
                    source: { filename: configFileLocation, name: 'CSpell Configstore' },
                }),
            }),
        );
        expect(mock_getRawGlobalSettings).toHaveBeenCalledOnce();
        expect(mock_writeRawGlobalSettings).not.toHaveBeenCalled();
    });

    test('addPathsToGlobalImports', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            import: [pathPython, pathCss],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });

        const r = addPathsToGlobalImports([pathCpp, pathPython, pathHtml]);

        expect(r.resolvedSettings).toHaveLength(3);
        expect(r).toEqual({
            success: true,
            resolvedSettings: [
                expect.objectContaining({ filename: pathCpp }),
                expect.objectContaining({ filename: pathPython }),
                expect.objectContaining({ filename: pathHtml }),
            ],
        });
        expect(mock_writeRawGlobalSettings).toHaveBeenCalledWith({
            import: [pathPython, pathCss, pathCpp, pathHtml],
        });
    });

    test('addPathsToGlobalImports with errors', () => {
        const pathNotFound = '__not_found_file_.ext';

        mock_getRawGlobalSettings.mockReturnValue({
            import: [pathPython],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });

        const r = addPathsToGlobalImports([pathCpp, pathPython, pathNotFound]);

        expect(r.resolvedSettings).toHaveLength(3);
        expect(r).toEqual({
            error: 'Unable to resolve files.',
            success: false,
            resolvedSettings: [
                expect.objectContaining({ filename: pathCpp }),
                expect.objectContaining({ filename: pathPython }),
                expect.objectContaining({
                    filename: pathNotFound,
                    error: expect.stringContaining('Failed to read config'),
                }),
            ],
        });
        expect(mock_writeRawGlobalSettings).not.toHaveBeenCalled();
    });

    test('removePathsFromGlobalImports', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            import: [pathCpp, pathPython, pathCss, pathHtml],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });

        const r = removePathsFromGlobalImports([pathCpp, '@cspell/dict-css']);

        expect(r).toEqual({
            success: true,
            error: undefined,
            removed: [pathCpp, pathCss],
        });

        expect(mock_writeRawGlobalSettings).toHaveBeenCalledWith({
            import: [pathPython, pathHtml],
        });
    });

    test('removePathsFromGlobalImports with unknown', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            import: [pathCpp, pathPython, pathCss, pathHtml],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });

        const r = removePathsFromGlobalImports([
            pathCpp,
            '@cspell/dict-unknown',
            'cspell-ext.json',
            '@cspell/dict-html',
            'python/cspell-ext.json',
        ]);

        expect(r).toEqual({
            success: true,
            error: undefined,
            removed: [pathCpp, pathHtml],
        });

        expect(mock_writeRawGlobalSettings).toHaveBeenCalledWith({
            import: [pathPython, pathCss],
        });
    });

    test('removePathsFromGlobalImports with nothing to remove', () => {
        mock_getRawGlobalSettings.mockReturnValue({
            import: [pathCpp, pathPython, pathCss, pathHtml],
            source: { filename: configFileLocation, name: 'CSpell Configstore' },
        });

        const r = removePathsFromGlobalImports(['@cspell/dict-unknown', 'cspell-ext.json', 'python/cspell-ext.json']);

        expect(r).toEqual({
            success: true,
            error: undefined,
            removed: [],
        });

        expect(mock_writeRawGlobalSettings).not.toHaveBeenCalled();
    });

    test('findPackageForCSpellConfig', () => {
        const pathPythonDir = Path.dirname(pathPython);
        const pathPythonPackage = Path.join(pathPythonDir, 'package.json');

        const found = findPackageForCSpellConfig(pathPythonDir);
        expect(found).toEqual({
            name: '@cspell/dict-python',
            filename: pathPythonPackage,
        });
    });

    test('findPackageForCSpellConfig not found', () => {
        const found = findPackageForCSpellConfig(pathPython);
        expect(found).toBeUndefined();
    });
});
