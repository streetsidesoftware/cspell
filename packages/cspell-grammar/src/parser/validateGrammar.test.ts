import * as TypeScriptGrammar from '../grammars/typescript';
import * as MarkdownGrammar from '../grammars/markdown';
import * as SimpleGrammar from '../grammars/simple';
import { validate } from './validateGrammar';

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
