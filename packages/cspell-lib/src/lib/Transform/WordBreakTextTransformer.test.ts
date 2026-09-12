import type { WordSegmentationSettings } from '@cspell/cspell-types';
import { describe, expect, test } from 'vitest';

import { softHyphen } from './Transformer.js';
import { createSoftWordBreakTextTransformer } from './WordBreakTextTransformer.js';

// cspell:ignore ptrvalue myptrval

describe('createSoftWordBreakTextTransformer', () => {
    test.each`
        settings                                                                    | input                      | expected
        ${{}}                                                                       | ${'ptrvalue'}              | ${'ptrvalue'}
        ${settingsFor({ ptr: '^ptr|' })}                                            | ${'ptrvalue'}              | ${'ptr' + softHyphen + 'value'}
        ${settingsFor({ ptr: '^ptr|' })}                                            | ${'myptrval'}              | ${'myptrval'}
        ${settingsFor({ iface: '^I|' })}                                            | ${'IError'}                | ${'I' + softHyphen + 'Error'}
        ${settingsFor({ suffix: '|code$' })}                                        | ${'errorcode'}             | ${'error' + softHyphen + 'code'}
        ${settingsFor({ suffix: '|code$' })}                                        | ${'codecode'}              | ${'code' + softHyphen + 'code'}
        ${settingsFor({ mid: 'error|code' })}                                       | ${'errorcode'}             | ${'error' + softHyphen + 'code'}
        ${settingsFor({ ptr: /(?<=\bptr)/ })}                                       | ${'ptrvalue'}              | ${'ptr' + softHyphen + 'value'}
        ${settingsFor({ s: /(?<=[A-Z])s(?=\w)/ })}                                  | ${'ERRORstr'}              | ${'ERROR' + softHyphen + 's' + softHyphen + 'tr'}
        ${settingsFor({ ptr: '/(?<=\\bptr)/' })}                                    | ${'ptrvalue'}              | ${'ptr' + softHyphen + 'value'}
        ${settingsFor({ ptr: '^ptr|', iface: '^I|' }, { ptr: true, iface: false })} | ${'ptrvalue'}              | ${'ptr' + softHyphen + 'value'}
        ${settingsFor({ ptr: '^ptr|', iface: '^I|' }, { ptr: true, iface: false })} | ${'const ptrvalue = null'} | ${'const ptr' + softHyphen + 'value = null'}
        ${settingsFor({ literal: '/code/' })}                                       | ${'errorcode'}             | ${'error' + softHyphen + 'code' + softHyphen}
    `('transforms $input with $settings', ({ settings, input, expected }) => {
        const t = createSoftWordBreakTextTransformer(settings);
        const result = t.transform(input);
        expect(result.text).toBe(expected);
    });

    test('does nothing when no rules are enabled', () => {
        const t = createSoftWordBreakTextTransformer({});
        const result = t.transform('hello world');
        expect(result.text).toBe('hello world');
    });

    test('applies multiple rules together', () => {
        const settings = settingsFor({ ptr: '^ptr|', iface: '^I|' }, { ptr: true, iface: true });
        const t = createSoftWordBreakTextTransformer(settings);
        expect(t.transform('ptrvalue').text).toBe('ptr' + softHyphen + 'value');
        expect(t.transform('IError').text).toBe('I' + softHyphen + 'Error');
    });
});

function settingsFor(
    definitions: Record<string, string | RegExp>,
    enabled?: Record<string, boolean>,
): WordSegmentationSettings {
    const softWordBreaks = enabled ?? Object.fromEntries(Object.keys(definitions).map((name) => [name, true]));
    return {
        softWordBreakDefinitions: definitions,
        softWordBreaks,
    };
}
