import { __testing__ } from './reportGenerator';

const { padLines } = __testing__;

describe('reportGenerator', () => {
    test.each`
        lines                              | expected
        ${[]}                              | ${[]}
        ${['file:2:3\tword\tcontext']}     | ${['file:2:3........|word|context']}
        ${['file:2:3\twords\tcontext']}    | ${['file:2:3........|words...|context']}
        ${['file:200:30\twords\tcontext']} | ${['file:200:30.....|words...|context']}
    `('padLines', ({ lines, expected }) => {
        function t(s: string): string {
            return s.replace(/\t/g, '|').replace(/\s/g, '.');
        }
        expect(padLines(lines).map(t)).toEqual(expected.map(t));
    });
});
