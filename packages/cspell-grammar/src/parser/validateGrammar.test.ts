import * as TypeScriptGrammar from '../grammars/typescript';
import * as MarkdownGrammar from '../grammars/markdown';
import { validate } from './validateGrammar';

describe('validateGrammar', () => {
    test.each`
        grammar                      | name
        ${TypeScriptGrammar.grammar} | ${'TypeScript'}
        ${MarkdownGrammar.grammar}   | ${'Markdown'}
    `('validate $name', ({ grammar }) => {
        expect(() => validate(grammar)).not.toThrow();
    });
});
