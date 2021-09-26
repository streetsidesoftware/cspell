import { getConfigHash } from './getConfigHash';
import * as HashModule from './hash';

const mockHash = jest.spyOn(HashModule, 'hash');
jest.mock('./hash', () => ({
    hash: jest.fn().mockReturnValue('TEST_HASH'),
}));
jest.mock('../../../package.json', () => ({ version: '0.0.0' }));

const TEST_CONFIG__INFO = {
    source: 'some-source-string-in-config-info',
    config: {},
};

describe('getConfigHash', () => {
    it('hashes version and config', () => {
        expect(getConfigHash(TEST_CONFIG__INFO)).toEqual('TEST_HASH');
        expect(mockHash).toBeCalledTimes(1);
        expect(mockHash.mock.calls[0][0]).toContain('0.0.0');
        expect(mockHash.mock.calls[0][0]).toContain('some-source-string-in-config-info');
    });

    it('caches hash for the same configInfo', () => {
        getConfigHash(TEST_CONFIG__INFO);
        expect(mockHash).toBeCalledTimes(1);
        getConfigHash(TEST_CONFIG__INFO);
        expect(mockHash).toBeCalledTimes(1);

        getConfigHash({
            source: 'some-other-source-string-in-config-info',
            config: {},
        });
        expect(mockHash).toBeCalledTimes(2);
    });
});
