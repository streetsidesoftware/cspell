/* eslint-disable unicorn/no-hex-escape */
import { pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { isBinaryDoc } from './isBinaryDoc.js';

describe('isBinaryDoc', () => {
    test.each`
        uri                | languageId      | text                               | expected
        ${import.meta.url} | ${'typescript'} | ${'console.log("Hello, World!");'} | ${false}
        ${import.meta.url} | ${undefined}    | ${undefined}                       | ${false}
        ${uh('image.jpg')} | ${undefined}    | ${undefined}                       | ${true}
        ${uh('film.mp4')}  | ${undefined}    | ${'\x00\x00\x00\x00'}              | ${true}
        ${uh('film.mp4')}  | ${undefined}    | ${undefined}                       | ${true}
        ${uh('data.bin')}  | ${undefined}    | ${'\x00\x00\x00\x00'}              | ${true}
        ${uh('data.dat')}  | ${undefined}    | ${'\x00\x00\x00\x00'}              | ${true}
    `('isBinaryDoc $uri $languageId', ({ uri, languageId, text, expected }) => {
        expect(isBinaryDoc({ uri, languageId, text })).toBe(expected);
    });
});

function uh(file: string) {
    return pathToFileURL(file).href;
}
