import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

type HashAlgorithm = 'SHA1';

export function calcChecksum(buf: Buffer, alg: HashAlgorithm = 'SHA1'): string {
    const hash = createHash(alg);
    hash.update(buf);
    return hash.digest('hex');
}

export function checkChecksum(checksum: string, buf: Buffer, alg?: HashAlgorithm): boolean {
    const value = calcChecksum(buf, alg);
    return value === checksum;
}

export async function calcFileChecksum(filename: string, alg?: HashAlgorithm): Promise<string> {
    const buf = await readFile(filename);
    return calcChecksum(buf, alg);
}

export async function checkFile(checksum: string, filename: string, alg?: HashAlgorithm): Promise<boolean> {
    return (await calcFileChecksum(filename, alg)) === checksum;
}
