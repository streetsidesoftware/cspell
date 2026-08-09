import { describe, expect, test } from 'vitest';

import { escapeXmlAttribute, escapeXmlText } from './escapeXml.js';

describe('escapeXmlText', () => {
    test('escapes &, <, and >', () => {
        expect(escapeXmlText('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
    });

    test('does not escape quotes', () => {
        expect(escapeXmlText(`"quoted" and 'apostrophe'`)).toBe(`"quoted" and 'apostrophe'`);
    });

    test('strips invalid XML control characters', () => {
        expect(escapeXmlText('bad\x00word\x1F\x7F\x84\x86\x9F')).toBe('badword');
    });

    test('leaves tab, newline, and carriage return intact', () => {
        expect(escapeXmlText('a\tb\nc\rd')).toBe('a\tb\nc\rd');
    });
});

describe('escapeXmlAttribute', () => {
    test('escapes &, <, >, ", and \'', () => {
        expect(escapeXmlAttribute(`a & b < c > d "e" 'f'`)).toBe('a &amp; b &lt; c &gt; d &quot;e&quot; &apos;f&apos;');
    });

    test('escapes a file path containing special characters', () => {
        expect(escapeXmlAttribute('src/<weird>&"path".ts')).toBe('src/&lt;weird&gt;&amp;&quot;path&quot;.ts');
    });
});
