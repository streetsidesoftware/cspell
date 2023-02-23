import { encodeUtf16BE, encodeUtf16LE } from './encode-decode';
import { decoderUtf, encoderUtf } from './transformUtf16';

const eBE = encodeUtf16BE;
const eLE = encodeUtf16LE;

const T = true;
const F = false;

describe('transformUtf16', () => {
    test.each`
        values                                                        | expected
        ${[]}                                                         | ${[]}
        ${['hello', 'there', Buffer.from('again'), Buffer.from('?')]} | ${['hello', 'there', 'again', '?']}
        ${[eLE('hello', T), eLE('there', F), eLE('again', F)]}        | ${['hello', 'there', 'again']}
        ${[eLE('hello', T), eLE('there', F), eLE('again', T)]}        | ${['hello', 'there', 'again']}
        ${[eBE('hello', T), eBE('there', F), eBE('again', F)]}        | ${['hello', 'there', 'again']}
        ${[eBE('hello', T), eBE('there', F), eBE('again', T)]}        | ${['hello', 'there', 'again']}
        ${encoderUtf('hello|there|again|?'.split('|'), 'utf8')}       | ${['hello', 'there', 'again', '?']}
        ${encoderUtf('hello|there|again|?'.split('|'), 'utf16le')}    | ${['hello', 'there', 'again', '?']}
        ${encoderUtf('hello|there|again|?'.split('|'), 'utf16be')}    | ${['hello', 'there', 'again', '?']}
    `('transformUtf16', async ({ values, expected }) => {
        expect(await toArray(decoderUtf(values))).toEqual(expected);
    });
});

async function toArray<T>(iter: AsyncIterable<T> | Iterable<T>): Promise<T[]> {
    const arr: T[] = [];
    for await (const value of iter) {
        arr.push(value);
    }
    return arr;
}
