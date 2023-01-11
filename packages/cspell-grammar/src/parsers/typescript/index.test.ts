import { promises as fs } from 'fs';
import * as path from 'path';
import type { ParseResult } from '@cspell/cspell-types/Parser';

import { parser } from './TypeScriptParser';

const fixtures = path.join(__dirname, '../../../fixtures');

describe('TypeScript Parser', () => {
    test('parser', () => {
        expect(parser.name).toBe('typescript');
    });

    test.each`
        filename
        ${'TypeScript/escape-codes.ts'}
        ${'TypeScript/sample1.ts'}
    `('parse $filename', async ({ filename }) => {
        const content = await readSample(filename);
        const p = parser.parse(content, filename);
        expect(stringifyResult(p)).toMatchSnapshot();
    });
});

function readSample(filename: string): Promise<string> {
    return fs.readFile(path.resolve(fixtures, filename), 'utf-8');
}

function stringifyResult(result: ParseResult): string {
    function mapParsedTexts(t: ParseResult['parsedTexts']): string[] {
        return [...t].map((p) => `${p.range[0]}-${p.range[1]} ${JSON.stringify(p.text)} ${p.scope?.toString() ?? ''}`);
    }

    return `\
filename: ${result.filename}
parsed:
${mapParsedTexts(result.parsedTexts).join('\n')}
`;
}
