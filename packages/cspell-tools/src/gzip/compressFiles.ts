import type { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { gunzip as gunzipCB, gzip as gz, gzipSync } from 'node:zlib';

const gzip = promisify(gz);
const gunzip = promisify(gunzipCB);

export enum OSFlags {
    auto = -1,
    FAT = 0,
    Unix = 3,
    HPFS = 6, // cspell:ignore hpfs
    MACOS = 7,
    NTFS = 11,
}

// https://docs.fileformat.com/compression/gz/#:~:text=A%20GZ%20file%20is%20a,compression%20formats%20on%20UNIX%20systems.

const OSSystemIDOffset = 9;

export async function compressFile(file: string, os?: OSFlags): Promise<string> {
    if (file.endsWith('.gz')) return file;

    const targetFile = file + '.gz';

    const zBuf = await compress(await readFile(file), os);
    await writeFile(targetFile, zBuf);
    return targetFile;
}

export async function compress(buf: string | Uint8Array | Buffer, os?: OSFlags): Promise<Uint8Array> {
    return fixOSSystemID(await gzip(buf), os);
}

export function compressSync(buf: string | Uint8Array | Buffer, os?: OSFlags): Uint8Array {
    return fixOSSystemID(gzipSync(buf), os);
}

/**
 * Compresses the data if it is not already compressed.
 * @param data
 * @returns
 */
export async function compressIfNeeded(data: Uint8Array): Promise<Uint8Array> {
    return isGZipped(data) ? data : compress(data);
}

/**
 * Checks if the data is GZipped.
 * @param data
 * @returns true if the data is GZipped
 */
export function isGZipped(data: Uint8Array | string): boolean {
    if (typeof data === 'string') return false;
    return data[0] === 0x1f && data[1] === 0x8b;
}

function fixOSSystemID(zBuf: Uint8Array, os: OSFlags = OSFlags.Unix): Uint8Array {
    const osFlag = os === OSFlags.auto ? zBuf[OSSystemIDOffset] : os;
    zBuf[OSSystemIDOffset] = osFlag;
    return zBuf;
}

type U8Array = Uint8Array<ArrayBuffer>;

export async function decompress(buf: Uint8Array | Buffer, encoding?: undefined): Promise<U8Array>;
export async function decompress(buf: Uint8Array | Buffer, encoding: 'utf8'): Promise<string>;
export async function decompress(buf: Uint8Array | Buffer, encoding: 'utf8' | undefined): Promise<string | U8Array>;
export async function decompress(buf: Uint8Array | Buffer, encoding?: 'utf8'): Promise<string | U8Array> {
    const dBuf = gunzip(buf);
    if (!encoding) return dBuf;
    return (await dBuf).toString(encoding);
}
