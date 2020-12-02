import { checkoutRepositoryAsync, repositoryDir, addRepository } from './repositoryHelper';
import { CaptureLogger } from './CaptureLogger';
import rimraf from 'rimraf';
import { join } from 'path';
import { promisify } from 'util';
import { addRepository as configAddRepository } from './config';

const rm = promisify(rimraf);
const defaultTimeout = 60000;

jest.mock('./config');

const mockAddRepository = configAddRepository as jest.Mock<typeof configAddRepository>;

describe('Validate repository helper', () => {
    interface TestCase {
        msg: string;
        repo: string;
        path: string;
        commit: string | undefined;
        expected: boolean;
    }

    test.each`
        msg           | repo                                                         | path                                         | commit                       | expected
        ${'master'}   | ${'https://github.com/streetsidesoftware/regexp-worker.git'} | ${'test/streetsidesoftware/regexp-worker-1'} | ${undefined}                 | ${true}
        ${'bad url'}  | ${'https://github.com/streetsidesoftware/missing.git'}       | ${'test/streetsidesoftware/regexp-worker-4'} | ${undefined}                 | ${false}
        ${'bad hash'} | ${'https://github.com/streetsidesoftware/regexp-worker.git'} | ${'test/streetsidesoftware/regexp-worker-5'} | ${'de9543cf171629badbadbad'} | ${false}
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

    test.each`
        msg         | repo                                                         | path
        ${'master'} | ${'https://github.com/streetsidesoftware/regexp-worker.git'} | ${'streetsidesoftware/regexp-worker'}
    `(
        'addRepository $msg $repo $path $commit',
        async ({ repo, path }: TestCase) => {
            const logger = new CaptureLogger();
            expect(await addRepository(logger, repo)).toBe(true);
            expect(mockAddRepository).toHaveBeenCalledWith(path, repo, expect.any(String));
        },
        defaultTimeout
    );
});
