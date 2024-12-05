import { describe, expect, test } from 'vitest';

import { categorizeString, isRandomString, scoreRandomString } from './isRandomString.js';

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
        ${'H4sIAAAAAAAAA72d3ZLjNpK276X6O6ztFX4l_WxnPN5whD3jsGd3DzomHGqJVa21StLqp9uOibn3LwgIKiD5AkyQ7Dpyu0QmkmQy'} | ${true}
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
        str                                                                                                      | expected
        ${''}                                                                                                    | ${0}
        ${'hello'}                                                                                               | ${0.15}
        ${'café'}                                                                                                | ${0.18}
        ${'café'.normalize('NFD')}                                                                               | ${0.25}
        ${'Hello'}                                                                                               | ${0.15}
        ${'expectCategorizeStringStrToBeExpected'}                                                               | ${0.18}
        ${'expect categorizeString str .toBe expected'}                                                          | ${0.31}
        ${'H4sIAAAAAAAAA72d3ZLjNpK276X6O6ztFX4lWxnPN5whD3jsGd3DzomHGqJVa21StLqp9uOibn3LwgIKiD5AkyQ7Dpyu0QmkmQy'} | ${0.63}
        ${'izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI'}                                    | ${0.57}
        ${'sampleOldFalsePositivesBase64'}                                                                       | ${0.21}
        ${'residencyStandard2DMultisampleBlockShape'}                                                            | ${0.15}
        ${'myNameSpace1/MyNameSpace2/mynamespace3/myserviceName'}                                                | ${0.29}
        ${'PxTransform12transformInvERKS0_'}                                                                     | ${0.27}
        ${'_ZNK5physx11PxTransform12transformInvERKNS_6PxVec3E'}                                                 | ${0.37}
        ${'_ZNK5physx11PxERKNS_6PxVec3E'}                                                                        | ${0.51}
        ${'To_EntityDto_And_To_DrivedEntityDto'}                                                                 | ${0.32}
        ${'MAX_BUFFER_SIZE'}                                                                                     | ${0.26}
    `('isRandomString $str', ({ str, expected }) => {
        expect(scoreRandomString(str))
            .greaterThanOrEqual(expected)
            .lessThanOrEqual(expected + 0.01);
    });
    // cspell:enable

    // cspell:disable
    test.each`
        str                                                                                                       | expected
        ${''}                                                                                                     | ${''}
        ${'hello'}                                                                                                | ${'1'}
        ${'Hello'}                                                                                                | ${'1'}
        ${'expectCategorizeStringStrToBeExpected'}                                                                | ${'1111111'}
        ${'expect categorizeString str .toBe expected'}                                                           | ${'1 11 1 311 1'}
        ${'H4sIAAAAAAAAA72d3ZLjNpK276X6O6ztFX4l+WxnPN5whD3jsGd3DzomHGqJVa21StLqp9uOibn3LwgIKiD5AkyQ7Dpyu0QmkmQy'} | ${'20120102112020201201+120120110121210110110121201201011'}
        ${'izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI'}                                     | ${'121211010110101210201121111212+12'}
    `('categorizeString $str', ({ str, expected }) => {
        expect(categorizeString(str)).toBe(expected);
    });
    // cspell:enable
});
