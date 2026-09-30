/**
 * The text encodings Node.js supports, the same as its global `BufferEncoding`.
 * Declared here so the published types do not need `@types/node`.
 */
export type BufferEncoding =
    | 'ascii'
    | 'utf8'
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    | 'utf-8'
    | 'utf16le'
    | 'utf-16le'
    | 'ucs2'
    | 'ucs-2'
    | 'base64'
    | 'base64url'
    | 'latin1'
    | 'binary'
    | 'hex';
