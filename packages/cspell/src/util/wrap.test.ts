import { Chalk } from 'chalk';
import { describe, expect, test } from 'vitest';

import { wordWrapAnsiText } from './wrap.js';

const chalk = new Chalk({ level: 3 });

describe('wrap', () => {
    const helloColored = chalk.blue('hello colored');

    test.each`
        text                               | width | indent       | expected
        ${''}                              | ${0}  | ${undefined} | ${''}
        ${'hello'}                         | ${2}  | ${undefined} | ${'hello'}
        ${helloColored}                    | ${2}  | ${undefined} | ${helloColored.replace('o c', 'o\nc')}
        ${helloColored}                    | ${2}  | ${' '}       | ${helloColored.replace('o c', 'o\n c')}
        ${helloColored}                    | ${2}  | ${'   '}     | ${helloColored.replace('o c', 'o\n   c')}
        ${'hello.there.how'}               | ${2}  | ${undefined} | ${'hello\n.there\n.how'}
        ${'hello.there.how'}               | ${2}  | ${' '}       | ${'hello\n .there\n .how'}
        ${'hello.there.how'}               | ${2}  | ${'  '}      | ${'hello\n  .there\n  .how'}
        ${'hello.there.how'}               | ${2}  | ${'   '}     | ${'hello\n   .there\n   .how'}
        ${'hello,there,how'}               | ${2}  | ${'   '}     | ${'hello,\n   there,\n   how'}
        ${'hello. there. how.'}            | ${2}  | ${'   '}     | ${'hello.\n   there.\n   how.'}
        ${'hello. there.\nhow.'}           | ${2}  | ${'   '}     | ${'hello.\n   there.\nhow.'}
        ${'hello. there.\nhow.'}           | ${2}  | ${''}        | ${'hello.\nthere.\nhow.'}
        ${'hello,there,how'}               | ${2}  | ${'--'}      | ${'hello,\n--there,\n--how'}
        ${'hello.there.how'}               | ${2}  | ${'--'}      | ${'hello\n--.there\n--.how'}
        ${'hello      there'}              | ${7}  | ${undefined} | ${'hello\nthere'}
        ${'hello      there'}              | ${7}  | ${undefined} | ${'hello\nthere'}
        ${'hello,,,,,,there'}              | ${7}  | ${undefined} | ${'hello,,\n,,,,\nthere'}
        ${'hello      there'}              | ${16} | ${undefined} | ${'hello      there'}
        ${'hello       there'}             | ${16} | ${undefined} | ${'hello\nthere'}
        ${chalk.green('hello      there')} | ${16} | ${undefined} | ${chalk.green('hello      there')}
    `('wordWrapAnsiText $text $width $indent', ({ text, width, indent, expected }) => {
        expect(wordWrapAnsiText(text, width, indent)).toBe(expected);
    });
});
