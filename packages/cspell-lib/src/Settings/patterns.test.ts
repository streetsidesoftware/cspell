import { RegExpPatternDefinition } from '.';
import { isDefined } from '../util/util';
import { resolvePatterns } from './patterns';

describe('patterns', () => {
    const patterns: RegExpPatternDefinition[] = [
        {
            name: 'comment-single-line',
            pattern: /#.*/g,
        },
        {
            name: 'comment-multi-line',
            pattern: /(?:\/\*[\s\S]*?\*\/)/g,
        },
        {
            name: 'comments',
            pattern: ['comment-single-line', 'comment-multi-line'],
        },
        { name: 'string', pattern: '".*?"' },
        { name: 'a', pattern: ['b', 'c'] },
        { name: 'b', pattern: ['a', 'c'] },
    ];
    const patternsByName = new Map(patterns.map((p) => [p.name, p]));

    function selectPatterns(...patterns: string[]): RegExpPatternDefinition[] {
        return patterns.map((p) => patternsByName.get(p)).filter(isDefined);
    }

    const p = selectPatterns;

    test.each`
        regExpList                | patternDefinitions         | expected
        ${[]}                     | ${[]}                      | ${[]}
        ${['string', 'hello']}    | ${p('string', 'comments')} | ${['".*?"', 'hello']}
        ${['string', 'comments']} | ${patterns}                | ${['".*?"', /#.*/g, /(?:\/\*[\s\S]*?\*\/)/g]}
        ${['a', 'b']}             | ${patterns}                | ${['c']}
    `('resolvePatterns $regExpList', ({ regExpList, patternDefinitions, expected }) => {
        expect(resolvePatterns(regExpList, patternDefinitions)).toEqual(expected);
    });
});
