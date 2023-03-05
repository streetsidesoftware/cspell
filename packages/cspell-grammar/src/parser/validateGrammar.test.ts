import { describe, expect, test } from 'vitest';

import * as MarkdownGrammar from '../grammars/markdown.js';
import * as SimpleGrammar from '../grammars/simple.js';
import * as TypeScriptGrammar from '../grammars/typescript.js';
import { validate } from './validateGrammar.js';

describe('validateGrammar', () => {
    test.each`
        grammar                      | name
        ${TypeScriptGrammar.grammar} | ${'TypeScript'}
        ${MarkdownGrammar.grammar}   | ${'Markdown'}
        ${SimpleGrammar.grammar}     | ${'Simple'}
    `('validate $name', ({ grammar }) => {
        expect(() => validate(grammar)).not.toThrow();
    });
});
