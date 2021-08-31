import { resolveModuleSync } from './resolve';
import * as Path from 'path';

const found = {
    error: undefined,
    found: true,
};

describe('resolve', () => {
    test.each`
        moduleId             | relativeTo                                    | expected
        ${'cspell'}          | ${__dirname}                                  | ${oc({ ...found, moduleId: 'cspell' })}
        ${'lerna'}           | ${__dirname}                                  | ${oc({ ...found, moduleId: 'lerna' })}
        ${'jest'}            | ${__dirname}                                  | ${oc({ ...found, moduleId: 'jest' })}
        ${'hunspell-reader'} | ${Path.join(__dirname, '../../cspell-tools')} | ${oc({ ...found, moduleId: 'hunspell-reader' })}
    `('resolveModule $moduleId', ({ moduleId, relativeTo, expected }) => {
        expect(resolveModuleSync(moduleId, relativeTo)).toEqual(expected);
    });
});

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
