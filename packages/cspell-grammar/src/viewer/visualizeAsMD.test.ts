import { promises as fs, readFileSync } from 'fs';
import * as path from 'path';

import { tokenizeText } from '..';
import { TypeScript } from '../grammars';
import { normalizeGrammar } from '../parser/grammarNormalizer';
import { tokenizedLinesToMarkdown } from './visualizeAsMD';

const pathPackage = path.join(__dirname, '../..');
const pathSamples = path.join(pathPackage, 'samples');
const pathTemp = path.join(pathPackage, 'temp');

const sampleTypescript = readFileSync(path.join(pathSamples, 'sampleJest.ts'), 'utf8');

describe('visualizeAsMD', () => {
    const gTypeScript = normalizeGrammar(TypeScript.grammar);

    test.each`
        lines
        ${tokenize('')}
        ${tokenize('\tconst greeting = "hello";\n')}
        ${tokenize(sampleTypescript)}
    `('tokenizedLinesToMarkdown', ({ lines }) => {
        expect(tokenizedLinesToMarkdown(lines)).toMatchSnapshot();
    });

    test.each`
        filename
        ${'samples/sampleJest.ts'}
    `('tokenizedLinesToMarkdown file $filename', async ({ filename }) => {
        filename = path.resolve(pathPackage, filename);
        const text = await fs.readFile(filename, 'utf8');
        const lines = tokenize(text);
        const md = tokenizedLinesToMarkdown(lines);
        expect(md).toMatchSnapshot();
        const tempFilename = path.join(pathTemp, 'samples', path.basename(filename) + '.md');
        await writeFile(tempFilename, `# Tokenized: \`${path.basename(tempFilename)}\`\n\n${md}`);
    });

    function tokenize(text: string) {
        return tokenizeText(text, gTypeScript);
    }
});

async function mkdirForFile(filename: string) {
    const dir = path.dirname(filename);
    const parent = path.dirname(dir);
    await fs.access(parent).catch(() => mkdirForFile(dir));
    return fs.access(dir).catch(() => fs.mkdir(dir));
}

async function writeFile(filename: string, content: string) {
    await mkdirForFile(filename);
    return fs.writeFile(filename, content, 'utf8');
}
