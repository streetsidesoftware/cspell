import { describe, expect, test } from 'vitest';

import { categorizeString, extractHexSequences, isRandomString, scoreRandomString } from './isRandomString.js';

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
        ${'_ZNK5physx11PxERKNS_6PxVec3E'}                                                                         | ${false}
    `('isRandomString $str', ({ str, expected }) => {
        expect(isRandomString(str)).toBe(expected);
    });
    // cspell:enable

    // cspell:disable
    test.each`
        str                                                                                                      | expected
        ${''}                                                                                                    | ${0}
        ${'hello'}                                                                                               | ${0.2}
        ${'café'}                                                                                                | ${0.25}
        ${'café'.normalize('NFD')}                                                                               | ${0.2}
        ${'Hello'}                                                                                               | ${0.2}
        ${'expectCategorizeStringStrToBeExpected'}                                                               | ${0.18}
        ${'expect categorizeString str .toBe expected'}                                                          | ${0.28}
        ${'H4sIAAAAAAAAA72d3ZLjNpK276X6O6ztFX4lWxnPN5whD3jsGd3DzomHGqJVa21StLqp9uOibn3LwgIKiD5AkyQ7Dpyu0QmkmQy'} | ${0.53}
        ${'izfrNTmQLnfsLzi2Wb9xPz2Qj9fQYGgeug3N2MkDuVHwpPcgkhHkJgCQuuvT+qZI'}                                    | ${0.51}
        ${'sampleOldFalsePositivesBase64'}                                                                       | ${0.2}
        ${'residencyStandard2DMultisampleBlockShape'}                                                            | ${0.17}
        ${'myNameSpace1/MyNameSpace2/mynamespace3/myserviceName'}                                                | ${0.28}
        ${'PxTransform12transformInvERKS0_'}                                                                     | ${0.22}
        ${'_ZNK5physx11PxTransform12transformInvERKNS_6PxVec3E'}                                                 | ${0.29}
        ${'_ZNK5physx11PxERKNS_6PxVec3E'}                                                                        | ${0.39}
        ${'To_EntityDto_And_To_DrivedEntityDto'}                                                                 | ${0.22}
        ${'MAX_BUFFER_SIZE'}                                                                                     | ${0.2}
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

    // cspell:disable
    test.each`
        str                                                            | expected
        ${''}                                                          | ${[]}
        ${'hello'}                                                     | ${[]}
        ${'1LogRecord_1a46bc9a3adab542be80be9671d2ff82e'}              | ${['1a46bc9a3adab542be80be9671d2ff82e']}
        ${'1LogRecord1a46bc9a3adab542be80be9671d2ff82e'}               | ${[]}
        ${'1LogRecord_1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e'}       | ${['1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e']}
        ${'1LogRecord-1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e'}       | ${['1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e']}
        ${'1LogRecord-1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e-hello'} | ${['1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e']}
        ${'1LogRecord-1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e_hello'} | ${['1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e']}
        ${'1LogRecord-1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e-apple'} | ${['1a46-bc9a-3ada-b542-be80-be96-71d2-ff82e']}
    `('extractHexSequences $str', ({ str, expected }) => {
        expect(extractHexSequences(str).map((a) => a.text)).toEqual(expected);
    });
    // cspell:enable
});
