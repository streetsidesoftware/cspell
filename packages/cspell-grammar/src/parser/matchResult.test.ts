import { createMatchResult, createSimpleMatchResult, segmentMatch } from './matchResult';

describe('matchResult', () => {
    test.each`
        input           | match     | expected
        ${'a good day'} | ${'good'} | ${oc({ index: 2, input: 'a good day', match: 'good', matches: ['good'] })}
    `('createSimpleMatchResult', ({ input, match, expected }) => {
        expect(crs(input, match)).toEqual(expected);
    });

    test.each`
        regexp                 | text              | expected                                                                                  | comment
        ${/m\w+/}              | ${'good morning'} | ${[{ match: 'morning', groupNum: 0, index: 5 }]}                                          | ${'No groups'}
        ${/(m\w+)/}            | ${'good morning'} | ${[oc({}), { match: 'morning', groupNum: 1, index: 5 }]}                                  | ${'One group'}
        ${/(?<a>m\w+)/}        | ${'good morning'} | ${[oc({}), { match: 'morning', groupNum: 1, index: 5, groupName: 'a' }]}                  | ${'Named group: '}
        ${/(\w\b)(?<=(.{7}))/} | ${'good morning'} | ${[oc({ match: 'g' }), { match: 'g', groupNum: 1, index: 11 }, oc({ match: 'morning' })]} | ${'With back reference'}
        ${/(\w\b)(?<=(.{7}))/} | ${'good morning'} | ${[oc({}), oc({ match: 'g' }), { match: 'morning', groupNum: 2, index: 5 }]}              | ${'With back reference'}
        ${/.+(a(?=p)).+/}      | ${'bad apple'}    | ${[oc({ match: 'bad apple' }), { match: 'a', groupNum: 1, index: 1 }]}                    | ${'Wrong match :-('}
    `('segmentMatch $regexp $text $comment', ({ regexp, text, expected }) => {
        const matchResult = cr(regexp, text);
        expect(segmentMatch(matchResult)).toEqual(expected);
    });
});

function cr(regexp: RegExp, text: string, lastIndex = 0) {
    const rx = RegExp(regexp, regexp.flags + 'g');
    rx.lastIndex = lastIndex;

    const r = rx.exec(text);
    if (!r) throw new Error(`Text "${text}" failed to match RegExp ${rx}`);
    return createMatchResult(r);
}

function crs(input: string, match: string) {
    const index = input.indexOf(match);
    if (index < 0) throw new Error(`Failed to find "$match" in "$input"`);
    return createSimpleMatchResult(match, input, index);
}

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
