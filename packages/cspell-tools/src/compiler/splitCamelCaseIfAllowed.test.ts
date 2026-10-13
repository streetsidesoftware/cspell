import { describe, expect, test } from 'vitest';

import { createAllowedSplitWords } from './createWordsCollection.ts';
import { splitCamelCaseIfAllowed } from './splitCamelCaseIfAllowed.ts';

describe('splitCamelCaseIfAllowed', () => {
    test.each`
        text                               | keepCase | allowed                             | expected
        ${''}                              | ${false} | ${undefined}                        | ${[]}
        ${'hello'}                         | ${false} | ${undefined}                        | ${['hello']}
        ${'helloThere'}                    | ${false} | ${['hello', 'there']}               | ${['hello', 'there']}
        ${'helloThere'}                    | ${false} | ${['hello', 'There']}               | ${['hello', 'There']}
        ${'helloThere'}                    | ${true}  | ${['hello', 'There']}               | ${['hello', 'There']}
        ${'ERRORCode'}                     | ${false} | ${['error', 'code']}                | ${['error', 'code']}
        ${'ERRORCode'}                     | ${true}  | ${['error', 'code']}                | ${['ERROR', 'code']}
        ${'ERRORCode'}                     | ${true}  | ${['code']}                         | ${['ERRORCode']}
        ${'ERRORCode'}                     | ${false} | ${['code']}                         | ${['ERRORCode']}
        ${'ErrorCode'}                     | ${true}  | ${['error', 'code']}                | ${['error', 'code']}
        ${'xmlUCSIsCatZ'}                  | ${true}  | ${['xml', 'UCS', 'is', 'cat', 'z']} | ${['xml', 'UCS', 'is', 'cat', 'z']}
        ${'ADP_ConnectionStateMsg_Closed'} | ${true}  | ${undefined}                        | ${['ADP', 'connection', 'state', 'msg', 'closed']}
    `('splitCamelCaseIfAllowed $text $keepCase $allowed', ({ text, keepCase, allowed, expected }) => {
        allowed = createAllowedSplitWords(allowed);
        expect(splitCamelCaseIfAllowed(text, allowed, keepCase, '', 4)).toEqual(expected);
    });

    test.each`
        text                | locale       | expected
        ${'Irak'}           | ${undefined} | ${['irak']}
        ${'Irak'}           | ${'tr-TR'}   | ${['\u0131rak']}
        ${'\u0130rak'}      | ${undefined} | ${['i\u0307rak']}
        ${'\u0130rak'}      | ${'tr-TR'}   | ${['irak']}
        ${'\uD801\uDC00ab'} | ${undefined} | ${['\uD801\uDC28ab']}
    `('lower-case a capitalized word $text with locale $locale', ({ text, locale, expected }) => {
        const allowed = createAllowedSplitWords(undefined);
        expect(splitCamelCaseIfAllowed(text, allowed, false, '', 4, locale)).toEqual(expected);
    });

    test.each`
        text                               | keepCase | allowed                             | min  | expected
        ${''}                              | ${false} | ${undefined}                        | ${4} | ${[]}
        ${'hello'}                         | ${false} | ${undefined}                        | ${4} | ${['hello']}
        ${'helloThere'}                    | ${false} | ${['hello', 'there']}               | ${4} | ${['hello+', '+there']}
        ${'helloThere'}                    | ${false} | ${['hello', 'There']}               | ${4} | ${['hello+', '+There']}
        ${'helloThere'}                    | ${true}  | ${['hello', 'There']}               | ${4} | ${['hello+', '+There']}
        ${'ERRORCode'}                     | ${false} | ${['error', 'code']}                | ${4} | ${['error+', '+code']}
        ${'ERRORCode'}                     | ${true}  | ${['error', 'code']}                | ${4} | ${['error+', '+code']}
        ${'ERRORCode'}                     | ${true}  | ${['code']}                         | ${4} | ${['ERRORCode']}
        ${'ERRORCode'}                     | ${false} | ${['code']}                         | ${4} | ${['ERRORCode']}
        ${'ErrorCode'}                     | ${true}  | ${['error', 'code']}                | ${4} | ${['error+', '+code']}
        ${'xmlUCSIsCatZ'}                  | ${true}  | ${['xml', 'UCS', 'is', 'cat', 'z']} | ${3} | ${['xml+', '+UCS+', 'is', '+cat+', 'z']}
        ${'xmlUCSIsCats'}                  | ${true}  | ${['xml', 'UCS', 'is', 'cats']}     | ${4} | ${['xml', 'UCS', 'is', '+cats']}
        ${'ADP_ConnectionStateMsg_Closed'} | ${true}  | ${undefined}                        | ${4} | ${['ADP', 'connection+', '+state+', 'msg', 'closed']}
    `(
        'splitCamelCaseIfAllowed $text $keepCase $allowed',
        ({ text, keepCase, allowed, expected, min: minCompoundLength }) => {
            allowed = createAllowedSplitWords(allowed);
            expect(splitCamelCaseIfAllowed(text, allowed, keepCase, '+', minCompoundLength)).toEqual(expected);
        },
    );
});

// cspell:ignore irak
