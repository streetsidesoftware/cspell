import { getStat } from './stat';

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
        ${__filename + '/not-found'}                                                     | ${oc({ code: 'ENOTDIR' })}
        ${__dirname + '/not-found'}                                                      | ${oc({ code: 'ENOENT' })}
    `('getStat with error $url', async ({ url, expected }) => {
        const r = await getStat(url);
        expect(r).toEqual(expected);
    });
});
