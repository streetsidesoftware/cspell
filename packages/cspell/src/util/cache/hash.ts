// cspell:word imurmurhash
import murmur from 'imurmurhash';

/**
 * Hash the given string using MurmurHash3
 */
export function hash(str: string): string {
    return murmur(str).result().toString(36);
}
