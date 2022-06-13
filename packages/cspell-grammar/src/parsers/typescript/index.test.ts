import { parser } from '.';
import { promises as fs } from 'fs';
import * as path from 'path';
import { ParseResult } from '@cspell/cspell-types/Parser';

const fixtures = path.join(__dirname, '../../../fixtures');

describe('TypeScript Parser', () => {
    const sample1File = 'TypeScript/escape-codes.ts';
    test('parser', () => {
        expect(parser.name).toBe('typescript');
    });

    test('parse sample', async () => {
        const content = await readSample(sample1File);
        const p = parser.parse(content, sample1File);
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
