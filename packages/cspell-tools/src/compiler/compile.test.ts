import * as path from 'path';
import { spyOnConsole } from '../test/console';
import { createTestHelper } from '../test/TestHelper';
import { compile } from './compile';
import { CompileRequest, Target } from '../config';
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
        format         | compress
        ${'plaintext'} | ${false}
        ${'plaintext'} | ${true}
    `('compile', async ({ format, compress }) => {
        const target: Target = {
            filename: 'myDictionary',
            format,
            sources: [sample('cities.txt')],
            compress,
        };
        const req: CompileRequest = {
            targets: [target],
        };

        await compile(req);

        const content = await readTextFile('myDictionary.txt');
        expect(content).toMatchSnapshot();
    });
});
