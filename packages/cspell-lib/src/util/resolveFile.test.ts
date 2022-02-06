import { resolveFile } from './resolveFile';
import * as path from 'path';
import { parse } from 'comment-json';
import * as fs from 'fs';
import * as os from 'os';

interface Config {
    import: string[];
}

const config: Config = parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'cspell-default.json'), 'utf-8')
) as unknown as Config;

const ext = path.extname(__filename);
const notFound = '1fgh0dld6y56cr1wls.r9bp0ckc00ds0gna.json';
const userNotFound = path.join('~', notFound);

describe('Validate resolveFile', () => {
    interface ResolveFileTest {
        filename: string;
        relativeTo: string;
        expected: string;
        found: boolean;
    }
    test.each`
        filename                                      | relativeTo   | expected                                               | found
        ${__filename}                                 | ${__dirname} | ${__filename}                                          | ${true}
        ${'.' + path.sep + path.basename(__filename)} | ${__dirname} | ${__filename}                                          | ${true}
        ${'.' + path.sep + notFound}                  | ${__dirname} | ${path.resolve(__dirname, notFound)}                   | ${false}
        ${path.relative(__dirname, __filename)}       | ${__dirname} | ${__filename}                                          | ${true}
        ${'@cspell/dict-cpp/cspell-ext.json'}         | ${__dirname} | ${require.resolve('@cspell/dict-cpp/cspell-ext.json')} | ${true}
        ${'cspell-ext.json'}                          | ${__dirname} | ${path.resolve(__dirname, 'cspell-ext.json')}          | ${false}
        ${`./resolveFile${ext}`}                      | ${__dirname} | ${require.resolve('./resolveFile')}                    | ${true}
        ${`resolveFile${ext}`}                        | ${__dirname} | ${require.resolve('./resolveFile')}                    | ${true}
        ${'lerna'}                                    | ${__dirname} | ${require.resolve('lerna')}                            | ${true}
        ${userNotFound}                               | ${__dirname} | ${path.resolve(path.join(os.homedir(), notFound))}     | ${false}
    `('resolveFile "$filename" rel "$relativeTo"', validateResolveFile);

    test.each(
        config.import
            .concat(config.import.map((f) => f.replace('node_modules/', '')))
            .map((f) => ({
                filename: f,
                relativeTo: __dirname,
                expected: require.resolve(f.replace('node_modules/', '')),
                found: true,
            }))
            .map(({ filename, relativeTo, expected, found }) => [filename, relativeTo, expected, found])
    )('resolveFile "%s" rel "%s"', validateResolveArgs);

    function validateResolveFile({ filename, relativeTo, expected, found }: ResolveFileTest) {
        validateResolveArgs(filename, relativeTo, expected, found);
    }

    function validateResolveArgs(filename: string, relativeTo: string, expected: string, found: boolean) {
        const r = resolveFile(filename, relativeTo);
        expect(r.filename).toBe(expected);
        expect(r.found).toBe(found);
    }
});
