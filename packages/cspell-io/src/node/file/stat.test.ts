import { join } from 'path';

import { getStat, getStatSync } from './stat';

const oc = expect.objectContaining;
const sc = expect.stringContaining;

describe('stat', () => {
    test.each`
        url                                                                                 | expected
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ eTag: sc('W/') })}
        ${__filename}                                                                       | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStat $url', async ({ url, expected }) => {
        const r = await getStat(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                              | expected
        ${'https://raw.gitubusrcotent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ code: 'ENOTFOUND' })}
        ${join(__dirname, 'not-found.nf')}                                               | ${oc({ code: 'ENOENT' })}
    `('getStat with error $url', async ({ url, expected }) => {
        const r = await getStat(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url           | expected
        ${__filename} | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStatSync $url', ({ url, expected }) => {
        const r = getStatSync(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                                 | expected
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ code: 'ENOENT' })}
        ${join(__dirname, 'not-found.nf')}                                                  | ${oc({ code: 'ENOENT' })}
    `('getStatSync with error $url', async ({ url, expected }) => {
        const r = await getStatSync(url);
        expect(r).toEqual(expected);
    });
});
