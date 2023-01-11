import * as path from 'path';
import { spyOnConsole } from '../test/console';
import { createTestHelper } from '../test/TestHelper';
import { compile } from './compile';
import type { CompileRequest, Target } from '../config';
import { readTextFile } from './readTextFile';

const testHelper = createTestHelper(__filename);

const pathSamples = path.join(testHelper.packageRoot, '../Samples/dicts');

function sample(...parts: string[]): string {
    return path.resolve(pathSamples, ...parts);
}

spyOnConsole();

describe('compile', () => {
    beforeAll(() => {
        testHelper.clearTempDir();
    });

    beforeEach(() => {
        testHelper.cdToTempDir();
    });

    test.each`
        file                   | format         | compress | generateNonStrict
        ${'cities.txt'}        | ${'plaintext'} | ${false} | ${true}
        ${'cities.txt'}        | ${'plaintext'} | ${true}  | ${true}
        ${'cities.txt'}        | ${'plaintext'} | ${false} | ${undefined}
        ${'cities.txt'}        | ${'plaintext'} | ${true}  | ${undefined}
        ${'cities.txt'}        | ${'trie3'}     | ${false} | ${undefined}
        ${'sampleCodeDic.txt'} | ${'plaintext'} | ${false} | ${undefined}
        ${'sampleCodeDic.txt'} | ${'plaintext'} | ${false} | ${true}
    `(
        'compile $file fmt: $format gz: $compress alt: $generateNonStrict',
        async ({ format, file, generateNonStrict, compress }) => {
            const targetDirectory = `.`;
            const target: Target = {
                name: 'myDictionary',
                targetDirectory,
                format,
                sources: [sample(file)],
                compress,
                generateNonStrict,
                trieBase: 10,
                sort: true,
            };
            const req: CompileRequest = {
                targets: [target],
            };

            await compile(req);

            const ext = (format === 'plaintext' ? '.txt' : '.trie') + ((compress && '.gz') || '');
            const content = await readTextFile(`${targetDirectory}/myDictionary${ext}`);
            expect(content).toMatchSnapshot();
        }
    );
});
