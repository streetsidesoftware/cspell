import { describe, expect, test } from 'vitest';

import type { CSpellSettings } from './CSpellSettingsDef.js';
import { lastValue, mergeConfig } from './merge.ts';

describe('mergeSettings', () => {
    test('should merge two empty configs', () => {
        const result = mergeConfig({}, {});
        expect(result).toEqual({});
    });

    test('should merge two empty configs', () => {
        const cfg: CSpellSettings = { words: ['words'] } as const;
        const result = mergeConfig([cfg]);
        expect(result).toEqual(cfg);
    });

    test('should return second config when first is empty', () => {
        const config: CSpellSettings = { name: 'test', version: '0.2' };
        const result = mergeConfig({}, config);
        expect(result).toEqual(config);
    });

    test('should return first config when second is empty', () => {
        const config = { name: 'test', version: '0.2' } as const;
        const result = mergeConfig(config, {});
        expect(result).toEqual(config);
    });

    test('should override properties from first config with second', () => {
        const config1 = { name: 'test1', version: '0.1', enabled: true } as const;
        const config2 = { name: 'test2', version: '0.2' } as const;
        const result = mergeConfig(config1, config2);
        expect(result).toEqual({ name: 'test2', version: '0.2', enabled: true });
        const result2 = mergeConfig([config1, config2]);
        expect(result2).toEqual({ name: 'test2', version: '0.2', enabled: true });
    });

    test('should pattern array properties by concatenation', () => {
        const config1: CSpellSettings = {
            words: ['hello', 'world'],
            patterns: [{ name: 'numbers', pattern: /\b\d+\b/g }],
        };
        const config2: CSpellSettings = { words: ['foo', 'bar'], patterns: [{ name: 'words', pattern: /\b\w+\b/g }] };
        const result = mergeConfig(config1, config2);
        expect(result).toEqual({
            words: ['hello', 'world', 'foo', 'bar'],
            patterns: [...(config1.patterns || []), ...(config2.patterns || [])],
        });
    });

    test.each`
        cfg1                                                       | cfg2                                                              | expected                                                                                               | comment
        ${c({ name: 'test1', version: '0.1', enabled: true })}     | ${c({ name: 'test2', version: '0.2' })}                           | ${c({ name: 'test2', version: '0.2', enabled: true })}                                                 | ${''}
        ${c({ name: 'test1' })}                                    | ${c({ name: 'test2', readonly: true })}                           | ${c({ name: 'test2', readonly: true })}                                                                | ${''}
        ${c({ name: 'test1', readonly: true })}                    | ${c({ name: 'test2', readonly: false })}                          | ${c({ name: 'test2', readonly: true })}                                                                | ${''}
        ${c({ words: ['w1'] })}                                    | ${c({ suggestWords: ['w2:w1'] })}                                 | ${c({ words: ['w1'], suggestWords: ['w2:w1'] })}                                                       | ${'words - non-unique'}
        ${c({ words: ['w1'] })}                                    | ${c({ words: ['w1'] })}                                           | ${c({ words: ['w1', 'w1'] })}                                                                          | ${'words, suggestWords'}
        ${[c({ words: ['w1'] })]}                                  | ${c({ words: ['w2'] })}                                           | ${c({ words: ['w1', 'w2'] })}                                                                          | ${'words'}
        ${[c({ words: ['w1'] }), c({ words: ['w2'] })]}            | ${undefined}                                                      | ${c({ words: ['w1', 'w2'] })}                                                                          | ${'words'}
        ${c({ words: ['w1'] })}                                    | ${undefined}                                                      | ${c({ words: ['w1'] })}                                                                                | ${'words'}
        ${c({ ignoreWords: ['w1'] })}                              | ${c({ ignoreWords: ['w1'] })}                                     | ${c({ ignoreWords: ['w1', 'w1'] })}                                                                    | ${'ignoreWords'}
        ${c({ userWords: ['w1'] })}                                | ${c({ userWords: ['w2'] })}                                       | ${c({ userWords: ['w1', 'w2'] })}                                                                      | ${'userWords'}
        ${c({ flagWords: ['w1'] })}                                | ${c({ flagWords: ['w2'] })}                                       | ${c({ flagWords: ['w1', 'w2'] })}                                                                      | ${'flagWords'}
        ${c({ vfs: { 'cspell-vfs:///file1': { data: 'd1' } } })}   | ${c({ vfs: { 'cspell-vfs:///file2': { data: 'd2' } } })}          | ${c({ vfs: { 'cspell-vfs:///file1': { data: 'd1' }, 'cspell-vfs:///file2': { data: 'd2' } } })}        | ${'vfs'}
        ${c({ vfs: { 'cspell-vfs:///file1': { data: 'd1' } } })}   | ${c({ dictionaries: [] })}                                        | ${c({ vfs: { 'cspell-vfs:///file1': { data: 'd1' } }, dictionaries: [] })}                             | ${'vfs'}
        ${c({ import: './cspell.config.yaml' })}                   | ${c({ import: ['./cspell.config.ts'] })}                          | ${c({ import: ['./cspell.config.yaml', './cspell.config.ts'] })}                                       | ${'import'}
        ${{ import: undefined }}                                   | ${c({ import: ['./cspell.config.ts'] })}                          | ${c({ import: ['./cspell.config.ts'] })}                                                               | ${'import - undefined should be ignored'}
        ${{ import: undefined }}                                   | ${c({})}                                                          | ${c({})}                                                                                               | ${'import - undefined should be ignored'}
        ${c({ engines: { cspell: '>=9.4.0' } })}                   | ${c({ engines: { 'code-spell-checker': '>4.6.2' } })}             | ${c({ engines: { cspell: '>=9.4.0', 'code-spell-checker': '>4.6.2' } })}                               | ${'engines'}
        ${c({ overrides: [{ filename: '*.ts', enabled: true }] })} | ${c({ overrides: [{ filename: '*.ts', dictionaries: ['ts'] }] })} | ${c({ overrides: [{ filename: '*.ts', enabled: true }, { filename: '*.ts', dictionaries: ['ts'] }] })} | ${'overrides'}
    `('merge $cfg1 + $cfg2: $comment', ({ cfg1, cfg2, expected }) => {
        const result = mergeConfig(cfg1, cfg2);
        expect(result).toEqual(expected);
    });
});

describe('lastValue', () => {
    test('should return the last value from an array', () => {
        expect(lastValue([1, 2, 3])).toBe(3);
    });

    test('should return undefined for an empty array', () => {
        expect(lastValue([])).toBeUndefined();
    });

    test('should return the last value when there are undefined values', () => {
        expect(lastValue([undefined, 1, undefined, 2, 3, undefined])).toBe(3);
    });
});

function c(cfg: CSpellSettings): CSpellSettings {
    return cfg;
}
