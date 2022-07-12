import {
    isServiceResponseFailure,
    isServiceResponseSuccess,
    isInstanceOfFn,
    ServiceRequestAsync,
    ServiceRequestSync,
    BaseServiceRequest,
} from './request';

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
        request                                           | kind                   | expected
        ${new ServiceRequestAsync('ServiceRequestAsync')} | ${BaseServiceRequest}  | ${true}
        ${new ServiceRequestSync('ServiceRequestSync')}   | ${BaseServiceRequest}  | ${true}
        ${new ServiceRequestAsync('ServiceRequestAsync')} | ${ServiceRequestAsync} | ${true}
        ${new ServiceRequestSync('ServiceRequestSync')}   | ${ServiceRequestSync}  | ${true}
        ${new ServiceRequestAsync('ServiceRequestAsync')} | ${ServiceRequestSync}  | ${false}
        ${new ServiceRequestSync('ServiceRequestSync')}   | ${ServiceRequestAsync} | ${false}
        ${{ type: 'static' }}                             | ${BaseServiceRequest}  | ${false}
    `('isInstanceOfFn $request.type', ({ request, kind, expected }) => {
        const fn = isInstanceOfFn(kind);
        expect(fn(request)).toEqual(expected);
    });
});
