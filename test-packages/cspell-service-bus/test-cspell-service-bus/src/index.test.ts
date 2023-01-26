import { createResponse, ServiceRequestCls } from '@cspell/cspell-service-bus';

import {
    createBus,
    DoNotHandleRequest,
    FibRequestFactory,
    RetryAgainRequest,
    smokeTest,
    StringLengthRequestFactory,
    StringToUpperRequest,
} from './index';

describe('Service Bus', () => {
    const bus = createBus();

    test.each`
        request                                                | expected
        ${FibRequestFactory.create({ fib: 6 })}                | ${createResponse(8)}
        ${FibRequestFactory.create({ fib: 5 })}                | ${createResponse(5)}
        ${FibRequestFactory.create({ fib: 7 })}                | ${createResponse(13)}
        ${StringLengthRequestFactory.create({ str: 'hello' })} | ${createResponse(5)}
        ${new StringToUpperRequest('hello')}                   | ${createResponse('HELLO')}
        ${new DoNotHandleRequest()}                            | ${{ error: Error('Unhandled Request: Do Not Handle') }}
        ${new RetryAgainRequest()}                             | ${{ error: Error('Service Request Depth 10 Exceeded: Retry Again Request') }}
        ${new ServiceRequestCls('throw', undefined)}           | ${{ error: Error('Unhandled Error in Handler: handlerThrowErrorOnRequest') }}
    `('serviceBus handle request: $request.type', ({ request, expected }) => {
        expect(bus.dispatch(request)).toEqual(expected);
    });

    test('smokeTest', () => {
        expect(smokeTest()).toBe(true);
    });
});
