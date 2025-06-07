import { describe, expect, test } from 'vitest';

import * as padJs from './pad.js';

describe('Validate Pad', () => {
    test.each`
        text       | n     | expected
        ${''}      | ${0}  | ${''}
        ${'hello'} | ${0}  | ${'hello'}
        ${'hello'} | ${-1} | ${'hello'}
        ${'a'}     | ${3}  | ${'  a'}
        ${'😀 😀'} | ${5}  | ${'  😀 😀'}
    `('padLeft $text', ({ text, n, expected }) => {
        expect(padJs.padLeft(text, n)).toBe(expected);
    });

    test.each`
        text         | n     | expected
        ${''}        | ${0}  | ${''}
        ${'hello'}   | ${0}  | ${'hello'}
        ${'hello'}   | ${-1} | ${'hello'}
        ${'a'}       | ${3}  | ${'a  '}
        ${'\u0009a'} | ${3}  | ${'\u0009a  '}
        ${'😀'}      | ${3}  | ${'😀  '}
        ${'😀 😀'}   | ${5}  | ${'😀 😀  '}
    `('pad $text', ({ text, n, expected }) => {
        expect(`|${padJs.pad(text, n)}|`.replaceAll(' ', '.')).toBe(`|${expected.replaceAll(' ', '.')}|`);
    });

    test.each`
        text                         | expected
        ${''}                        | ${0}
        ${'hello'}                   | ${5}
        ${'résumé'}                  | ${6}
        ${'résumé'.normalize('NFD')} | ${6}
        ${'a'}                       | ${1}
        ${'\u0009a'}                 | ${1}
        ${'😀'}                      | ${1}
        ${'😀 😀'}                   | ${3}
    `('width $text', ({ text, expected }) => {
        expect(padJs.width(text)).toBe(expected);
    });

    const aAccent = 'ä'.normalize('NFD');
    const eAccent = 'é'.normalize('NFD');
    const aeAccent = 'äé'.normalize('NFD');

    test.each`
        text                         | width | expected
        ${''}                        | ${0}  | ${''}
        ${'hello'}                   | ${0}  | ${'hello'}
        ${'hello'}                   | ${-1} | ${'hello'}
        ${'résumé'}                  | ${6}  | ${'résumé'}
        ${'résumé'.normalize('NFD')} | ${6}  | ${'résumé'.normalize('NFD')}
        ${'résumé'.normalize('NFD')} | ${4}  | ${'rés…'.normalize('NFD')}
        ${eAccent.repeat(5)}         | ${5}  | ${eAccent.repeat(5)}
        ${eAccent.repeat(5)}         | ${7}  | ${eAccent.repeat(5)}
        ${eAccent.repeat(5)}         | ${3}  | ${eAccent.repeat(2) + '…'}
        ${aeAccent.repeat(6)}        | ${3}  | ${aeAccent.repeat(1) + '…'}
        ${aeAccent.repeat(6)}        | ${11} | ${aeAccent.repeat(5) + '…'}
        ${aeAccent.repeat(6)}        | ${10} | ${aeAccent.repeat(4) + aAccent + '…'}
        ${aeAccent.repeat(6)}        | ${6}  | ${aeAccent.repeat(2) + aAccent + '…'}
    `('pruneEnd $text $width', ({ text, width, expected }) => {
        expect(padJs.pruneTextEnd(text, width)).toBe(expected);
    });

    // cspell:ignore sumé
    test.each`
        text                         | width | expected
        ${''}                        | ${0}  | ${''}
        ${'hello'}                   | ${0}  | ${'hello'}
        ${'hello'}                   | ${-1} | ${'hello'}
        ${'hello'}                   | ${3}  | ${'…lo'}
        ${'résumé'}                  | ${6}  | ${'résumé'}
        ${'résumé'.normalize('NFD')} | ${6}  | ${'résumé'.normalize('NFD')}
        ${'résumé'.normalize('NFD')} | ${4}  | ${'…umé'.normalize('NFD')}
        ${'résumé'.normalize('NFD')} | ${5}  | ${'…sumé'.normalize('NFD')}
        ${eAccent.repeat(5)}         | ${5}  | ${eAccent.repeat(5)}
        ${eAccent.repeat(5)}         | ${7}  | ${eAccent.repeat(5)}
        ${eAccent.repeat(5)}         | ${3}  | ${'…' + eAccent.repeat(2)}
        ${aeAccent.repeat(6)}        | ${11} | ${'…' + aeAccent.repeat(5)}
        ${aeAccent.repeat(6)}        | ${10} | ${'…' + eAccent + aeAccent.repeat(4)}
        ${aeAccent.repeat(6)}        | ${6}  | ${'…' + eAccent + aeAccent.repeat(2)}
    `('pruneStart $text $width', ({ text, width, expected }) => {
        expect(padJs.pruneTextStart(text, width)).toBe(expected);
    });
});
