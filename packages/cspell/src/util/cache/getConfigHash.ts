import stringify from 'fast-json-stable-stringify';
import path from 'path';
import { ConfigInfo } from '../../util/fileHelper';
import { hash } from './hash';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));
const configHashes: WeakMap<ConfigInfo, string> = new WeakMap();

/**
 * Hashes ConfigInfo and cspell version for using in DiskCache
 */
export function getConfigHash(configInfo: ConfigInfo): string {
    const cachedHash = configHashes.get(configInfo);
    if (cachedHash !== undefined) {
        return cachedHash;
    }

    const hashValue = hash(`${version}_${stringify(configInfo)}`);
    configHashes.set(configInfo, hashValue);

    return hashValue;
}
