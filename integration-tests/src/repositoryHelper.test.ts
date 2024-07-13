import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CaptureLogger } from './CaptureLogger.js';
import { addRepository as configAddRepository } from './config.js';
import { addRepository, checkoutRepositoryAsync, repositoryDir } from './repositoryHelper.js';

const defaultTimeout = 60_000;

vi.mock('./config.js');

const mockAddRepository = configAddRepository as Mock<typeof configAddRepository>;

describe('Validate repository helper', () => {
    interface TestCase {
        msg: string;
        repo: string;
        path: string;
        commit: string | undefined;
        expected: boolean;
    }

    beforeEach(() => {
        vi.resetAllMocks();
        mockAddRepository.mockImplementation((path, url) => ({
            path,
            url,
            commit: '',
            branch: undefined,
            args: [],
            postCheckoutSteps: undefined,
        }));
    });

    test.each`
        msg           | repo                                                         | path                                         | commit                       | expected
        ${'main'}     | ${'https://github.com/streetsidesoftware/regexp-worker.git'} | ${'test/streetsidesoftware/regexp-worker-1'} | ${undefined}                 | ${true}
        ${'bad url'}  | ${'https://github.com/streetsidesoftware/missing.git'}       | ${'test/streetsidesoftware/regexp-worker-4'} | ${undefined}                 | ${false}
        ${'bad hash'} | ${'https://github.com/streetsidesoftware/regexp-worker.git'} | ${'test/streetsidesoftware/regexp-worker-5'} | ${'de9543cf171629badbadbad'} | ${false}
    `(
        'checkoutRepositoryAsync $msg $repo $path $commit',
        async ({ repo, path, commit, expected }: TestCase) => {
            const logger = new CaptureLogger();
            await fs.rm(join(repositoryDir, path), { recursive: true, force: true });
            commit = commit || 'main';
            expect(await checkoutRepositoryAsync(logger, repo, path, commit, undefined)).toBe(expected);
            // console.log(logger.logs);
            // console.log(logger.errors);
        },
        defaultTimeout,
    );

    test.each`
        msg             | repo                                                             | path
        ${'main'}       | ${'https://github.com/streetsidesoftware/regexp-worker.git'}     | ${'streetsidesoftware/regexp-worker'}
        ${'issue-1114'} | ${'https://github.com/streetsidesoftware/cspell-test-cases.git'} | ${'streetsidesoftware/cspell-test-cases'}
    `(
        'addRepository $msg $repo $path',
        async ({ repo, path }: TestCase) => {
            const logger = new CaptureLogger();
            expect(await addRepository(logger, repo, undefined)).toEqual(expect.objectContaining({ path, url: repo }));
            expect(mockAddRepository).toHaveBeenCalledWith(path, repo, expect.any(String), undefined);
        },
        defaultTimeout,
    );
});
