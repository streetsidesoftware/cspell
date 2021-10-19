import { escapeHtml, escapeMarkdown } from './escapeMarkdown';

describe('escapeMarkdown', () => {
    test.each`
        text              | expected
        ${''}             | ${''}
        ${'/["\'&<>]/'}   | ${'/[&quot;&#39;&amp;&lt;&gt;]/'}
        ${'Good morning'} | ${'Good morning'}
    `('escapeHtml $text', ({ text, expected }) => {
        expect(escapeHtml(text)).toBe(expected);
    });

    test.each`
        text                                   | expected
        ${/[-"'&<>`*_+[\]()\\|~]/g.toString()} | ${'/&#91;&#45;&quot;&#39;&amp;&lt;&gt;&#96;&#42;&#95;&#43;&#91;&#92;&#93;&#40;&#41;&#92;&#92;&#124;&#126;&#93;/g'}
        ${'Good morning'}                      | ${'Good morning'}
        ${'**bold**'}                          | ${'&#42;&#42;bold&#42;&#42;'}
    `('escapeMarkdown $text', ({ text, expected }) => {
        expect(escapeMarkdown(text)).toBe(expected);
    });
});
