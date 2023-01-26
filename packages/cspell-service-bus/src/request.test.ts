import { describe, expect, test } from 'vitest';

import {
    __testing__,
    isInstanceOfFn,
    isServiceResponseFailure,
    isServiceResponseSuccess,
    ServiceRequestCls,
} from './request.js';

const { BaseServiceRequest } = __testing__;

describe('request', () => {
    test.each`
        response                                | expected
        ${{ error: 'error' }}                   | ${true}
        ${{ value: 'error' }}                   | ${false}
        ${{ value: 'error', error: undefined }} | ${false}
        ${{ value: 'error', error: 'fail' }}    | ${true}
    `('isServiceResponseFailure $response', ({ response, expected }) => {
        expect(isServiceResponseFailure(response)).toEqual(expected);
    });

    test.each`
        response                             | expected
        ${{ error: 'error' }}                | ${false}
        ${{}}                                | ${false}
        ${{ value: undefined }}              | ${true}
        ${{ value: 'ok', error: undefined }} | ${true}
        ${{ value: 'ok', error: 'fail' }}    | ${false}
    `('isServiceResponseSuccess $response', ({ response, expected }) => {
        expect(isServiceResponseSuccess(response)).toEqual(expected);
    });

    test.each`
        request                                                   | kind                  | expected
        ${new ServiceRequestCls('ServiceRequestSync', undefined)} | ${BaseServiceRequest} | ${true}
        ${new ServiceRequestCls('ServiceRequestSync', undefined)} | ${ServiceRequestCls}  | ${true}
        ${{ type: 'static' }}                                     | ${BaseServiceRequest} | ${false}
    `('isInstanceOfFn $request.type', ({ request, kind, expected }) => {
        const fn = isInstanceOfFn(kind);
        expect(fn(request)).toEqual(expected);
    });
});
