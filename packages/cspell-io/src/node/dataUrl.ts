import { promises as fs } from 'fs';
import * as fsPath from 'path';

import { toURL } from './file/util';

/**
 * Generates a string of the following format:
 *
 * `data:[mediaType][;charset=<encoding>[;base64],<data>`
 *
 * - `encoding` - defaults to `utf8` for text data
 * @param data
 * @param mediaType - The mediaType is a [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) type string
 * @param attributes - Additional attributes
 */
export function encodeDataUrl(
    data: string | Buffer,
    mediaType: string,
    attributes?: Iterable<readonly [string, string]> | undefined
): string {
    if (typeof data === 'string') return encodeString(data, mediaType, attributes);
    const attribs = encodeAttributes(attributes || []);
    return `data:${mediaType}${attribs};base64,${data.toString('base64url')}`;
}

export function toDataUrl(
    data: string | Buffer,
    mediaType: string,
    attributes?: Iterable<[string, string]> | undefined
): URL {
    return new URL(encodeDataUrl(data, mediaType, attributes));
}

function encodeString(
    data: string,
    mediaType: string | undefined,
    attributes: Iterable<readonly [string, string]> | undefined
): string {
    mediaType = mediaType || 'text/plain';
    attributes = attributes || [];
    const asUrlComp = encodeURIComponent(data);
    const asBase64 = Buffer.from(data).toString('base64url');
    const useBase64 = asBase64.length < asUrlComp.length - 7;
    const encoded = useBase64 ? asBase64 : asUrlComp;
    // Ensure charset is first.
    const attribMap = new Map([['charset', 'utf8'] as readonly [string, string]].concat([...attributes]));
    attribMap.set('charset', 'utf8'); // Make sure it is always `utf8`.
    const attribs = encodeAttributes(attribMap);
    return `data:${mediaType}${attribs}${useBase64 ? ';base64' : ''},${encoded}`;
}

export interface DecodedDataUrl {
    data: Buffer;
    mediaType: string;
    encoding?: string | undefined;
    attributes: Map<string, string>;
}

function encodeAttributes(attributes: Iterable<readonly [string, string]>): string {
    return [...attributes].map(([key, value]) => `;${key}=${encodeURIComponent(value)}`).join('');
}

const dataUrlRegExHead = /^data:(?<mediaType>[^;,]*)(?<attributes>(?:;[^=]+=[^;,]*)*)(?<base64>;base64)?$/;

export function decodeDataUrl(url: string | URL): DecodedDataUrl {
    url = url.toString();
    const [head, encodedData] = url.split(',', 2);
    if (!head || encodedData === undefined) throw Error('Not a data url');
    const match = head.match(dataUrlRegExHead);
    if (!match || !match.groups) throw Error('Not a data url');
    const mediaType = match.groups['mediaType'] || '';
    const rawAttributes = (match.groups['attributes'] || '')
        .split(';')
        .filter((a) => !!a)
        .map((entry) => entry.split('=', 2))
        .map(([key, value]) => [key, decodeURIComponent(value)] as [string, string]);
    const attributes = new Map(rawAttributes);
    const encoding = attributes.get('charset');
    const isBase64 = !!match.groups['base64'];
    const data = isBase64 ? Buffer.from(encodedData, 'base64url') : Buffer.from(decodeURIComponent(encodedData));
    return { mediaType, data, encoding, attributes };
}

export async function encodeDataUrlFromFile(
    path: string | URL,
    mediaType?: string,
    attributes?: Iterable<readonly [string, string]> | undefined
): Promise<string> {
    const url = toURL(path);
    const filename = fsPath.basename(url.pathname);
    const guess = guessMimeType(filename);
    mediaType = mediaType || guess?.mimeType || 'text/plain';
    const _attributes = new Map(attributes || []);
    filename && _attributes.set('filename', filename);
    const content = guess?.encoding ? await fs.readFile(url, guess?.encoding) : await fs.readFile(url);
    return encodeDataUrl(content, mediaType, _attributes);
}

export interface GuessMimeTypeResult {
    mimeType: string;
    encoding?: 'utf-8' | undefined;
}

export function guessMimeType(filename: string): GuessMimeTypeResult | undefined {
    if (filename.endsWith('.trie')) return { mimeType: 'application/vnd.cspell.dictionary+trie', encoding: 'utf-8' };
    if (filename.endsWith('.trie.gz')) return { mimeType: 'application/vnd.cspell.dictionary+trie.gz' };
    if (filename.endsWith('.txt')) return { mimeType: 'text/plain', encoding: 'utf-8' };
    if (filename.endsWith('.gz')) return { mimeType: 'application/gzip' };
    if (filename.endsWith('.json')) return { mimeType: 'application/json', encoding: 'utf-8' };
    if (filename.endsWith('.yaml') || filename.endsWith('.yml'))
        return { mimeType: 'application/x-yaml', encoding: 'utf-8' };
    return undefined;
}
