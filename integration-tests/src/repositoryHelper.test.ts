import { checkoutRepositoryAsync, repositoryDir } from './repositoryHelper';
import { CaptureLogger } from './CaptureLogger';
import rimraf from 'rimraf';
import { join } from 'path';
import { promisify } from 'util';

const rm = promisify(rimraf);
const defaultTimeout = 60000;

describe('Validate repository helper', () => {
    interface TestCase {
        msg: string;
        repo: string;
        path: string;
        commit: string | undefined;
        expected: boolean;
    }

    test.each`
        msg           | repo                                                           | path                                           | commit                                        | expected
        ${'master'}   | ${'https://github.com/streetsidesoftware/hunspell-reader.git'} | ${'test/streetsidesoftware/hunspell-reader-1'} | ${undefined}                                  | ${true}
        ${'hash'}     | ${'https://github.com/streetsidesoftware/hunspell-reader.git'} | ${'test/streetsidesoftware/hunspell-reader-2'} | ${'de9543cf1716299ca45c02d4c411dbdd6a5df233'} | ${true}
        ${'tag'}      | ${'https://github.com/streetsidesoftware/hunspell-reader.git'} | ${'test/streetsidesoftware/hunspell-reader-3'} | ${'v3.1.5'}                                   | ${true}
        ${'bad url'}  | ${'https://github.com/missing/hunspell-reader.git'}            | ${'test/streetsidesoftware/hunspell-reader-3'} | ${'v3.1.5'}                                   | ${false}
        ${'bad hash'} | ${'https://github.com/streetsidesoftware/hunspell-reader.git'} | ${'test/streetsidesoftware/hunspell-reader-2'} | ${'de9543cf171629badbadbad'}                  | ${false}
    `(
        'checkoutRepositoryAsync $msg $repo $path $commit',
        async ({ repo, path, commit, expected }: TestCase) => {
            const logger = new CaptureLogger();
            await rm(join(repositoryDir, path));
            expect(await checkoutRepositoryAsync(logger, repo, path, commit)).toBe(expected);
            // console.log(logger.logs);
            // console.log(logger.errors);
        },
        defaultTimeout
    );
});
