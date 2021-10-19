import { tokenizedLinesToMarkdown } from './visualizeAsMD';
import { TypeScript } from '../grammars';
import { normalizeGrammar } from '../parser/grammarNormalizer';
import { tokenizeText } from '../dist';

const sampleText = `
    ${
        '.'.repeat(22) + // Comment
        { name: 'First' }.name
    }
`;

describe('visualizeAsMD', () => {
    const gTypeScript = normalizeGrammar(TypeScript.grammar);

    test.each`
        lines
        ${tokenize('')}
        ${tokenize('\tconst greeting = "hello";\n')}
    `('tokenizedLinesToMarkdown', ({ lines }) => {
        expect(tokenizedLinesToMarkdown(lines)).toMatchSnapshot();
    });

    function tokenize(text: string) {
        return tokenizeText(text, gTypeScript);
    }
});
