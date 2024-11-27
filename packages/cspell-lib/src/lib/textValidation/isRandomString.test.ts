import { describe, expect, test } from 'vitest';

import { categorizeString, isRandomString } from './isRandomString.js';

describe('isRandomString', () => {
    // cspell:disable
    test.each`
        str                                                                                                       | expected
        ${''}                                                                                                     | ${false}
        ${'hello'}                                                                                                | ${false}
        ${'café'}                                                                                                 | ${false}
        ${'café'.normalize('NFD')}                                                                                | ${false}
        ${'Hello'}                                                                                                | ${false}
        ${'expectCategorizeStringStrToBeExpected'}                                                                | ${false}
        ${'expect categorizeString str .toBe expected'}                                                           | ${false}
        ${'H4sIAAAAAAAAA72d3ZLjNpK276X6O6ztFX4l+WxnPN5whD3jsGd3DzomHGqJVa21StLqp9uOibn3LwgIKiD5AkyQ7Dpyu0QmkmQy'} | ${true}
        ${'izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI'}                                     | ${true}
        ${'sampleOldFalsePositivesBase64'}                                                                        | ${false}
        ${'residencyStandard2DMultisampleBlockShape'}                                                             | ${false}
        ${'myNameSpace1/MyNameSpace2/mynamespace3/myserviceName'}                                                 | ${false}
        ${'PxTransform12transformInvERKS0_'}                                                                      | ${false}
        ${'_ZNK5physx11PxTransform12transformInvERKNS_6PxVec3E'}                                                  | ${false}
        ${'_ZNK5physx11PxERKNS_6PxVec3E'}                                                                         | ${true}
    `('isRandomString $str', ({ str, expected }) => {
        expect(isRandomString(str)).toBe(expected);
    });
    // cspell:enable

    // cspell:disable
    test.each`
        str                                                                                                       | expected
        ${''}                                                                                                     | ${''}
        ${'hello'}                                                                                                | ${'1'}
        ${'Hello'}                                                                                                | ${'21'}
        ${'expectCategorizeStringStrToBeExpected'}                                                                | ${'1212121212121'}
        ${'expect categorizeString str .toBe expected'}                                                           | ${'1 121 1 3121 1'}
        ${'H4sIAAAAAAAAA72d3ZLjNpK276X6O6ztFX4l+WxnPN5whD3jsGd3DzomHGqJVa21StLqp9uOibn3LwgIKiD5AkyQ7Dpyu0QmkmQy'} | ${'201201021212020201201+21201201210212121021210121021212021202102121'}
        ${'izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI'}                                     | ${'121212102101210210121020212121212121212+12'}
    `('categorizeString $str', ({ str, expected }) => {
        expect(categorizeString(str)).toBe(expected);
    });
    // cspell:enable
});
