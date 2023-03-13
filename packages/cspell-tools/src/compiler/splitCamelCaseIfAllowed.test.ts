import { createAllowedSplitWords } from './createWordsCollection';
import { splitCamelCaseIfAllowed } from './splitCamelCaseIfAllowed';

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
        expect(splitCamelCaseIfAllowed(text, allowed, keepCase)).toEqual(expected);
    });
});
