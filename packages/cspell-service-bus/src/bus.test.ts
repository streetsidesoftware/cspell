import { describe, expect, test } from 'vitest';

import { createServiceBus } from './bus.js';
import { createIsRequestHandler } from './createRequestHandler.js';
import type { Dispatcher } from './Dispatcher.js';
import type { Handler } from './handlers.js';
import type { ServiceRequest, ServiceResponse } from './request.js';
import { createResponse as response, ServiceRequestCls } from './request.js';
import { requestFactory } from './requestFactory.js';
import type { ServiceRequestFactoryRequestType } from './ServiceRequestFactory.js';

function calcFib(request: FibRequest): ServiceResponse<number> {
    let a = 0,
        b = 1;
    let n = request.params.fib;

    while (--n >= 0) {
        const c = a + b;
        a = b;
        b = c;
    }

    return {
        value: a,
    };
}

const TypeRequestFib = 'Computations:calc-fib' as const;
const FibRequestFactory = requestFactory<typeof TypeRequestFib, { readonly fib: number }, number>(TypeRequestFib);
type FibRequestFactory = typeof FibRequestFactory;
type FibRequest = ServiceRequestFactoryRequestType<FibRequestFactory>;

const StringLengthRequestFactory = requestFactory<'calc-string-length', { readonly str: string }, number>(
    'calc-string-length',
);

class StringToUpperRequest extends ServiceRequestCls<'toUpper', { readonly str: string }, string> {
    constructor(readonly str: string) {
        super('toUpper', { str });
    }
    static is(req: ServiceRequest): req is StringToUpperRequest {
        return req instanceof StringToUpperRequest;
    }
}

class DoNotHandleRequest extends ServiceRequestCls<'Do Not Handle', undefined, undefined> {
    constructor() {
        super('Do Not Handle', undefined);
    }
}

class RetryAgainRequest extends ServiceRequestCls<'Retry Again Request', undefined, undefined> {
    constructor() {
        super('Retry Again Request', undefined);
    }
    static is(req: ServiceRequest): req is RetryAgainRequest {
        return req instanceof RetryAgainRequest;
    }
}

const handlerStringLengthRequest = createIsRequestHandler(
    StringLengthRequestFactory.is,
    (r) => response(r.params.str.length),
    'handlerStringLengthRequest',
);
const handlerStringToUpperRequest = createIsRequestHandler(
    StringToUpperRequest.is,
    (r) => response(r.str.toLocaleUpperCase()),
    'handlerStringToUpperRequest',
);
const handlerRetryAgainRequest: Handler = {
    fn: (service: Dispatcher) => (next) => (request) =>
        RetryAgainRequest.is(request) ? service.dispatch(request) : next(request),
    name: 'handlerRetryAgainRequest',
};
const handlerThrowErrorOnRequest: Handler = {
    fn: (_service: Dispatcher) => (next) => (request) => {
        if (request.type == 'throw') throw 'error';
        return next(request);
    },
    name: 'handlerThrowErrorOnRequest',
};
describe('Service Bus', () => {
    const bus = createServiceBus();
    bus.addHandler(handlerThrowErrorOnRequest)
        .addHandler(FibRequestFactory.createRequestHandler(calcFib))
        .addHandler(handlerStringLengthRequest)
        .addHandler(handlerStringToUpperRequest)
        .addHandler(handlerRetryAgainRequest);

    test.each`
        request                                                | expected
        ${FibRequestFactory.create({ fib: 6 })}                | ${response(8)}
        ${FibRequestFactory.create({ fib: 5 })}                | ${response(5)}
        ${FibRequestFactory.create({ fib: 7 })}                | ${response(13)}
        ${StringLengthRequestFactory.create({ str: 'hello' })} | ${response(5)}
        ${new StringToUpperRequest('hello')}                   | ${response('HELLO')}
        ${new DoNotHandleRequest()}                            | ${{ error: new Error('Unhandled Request: Do Not Handle') }}
        ${new RetryAgainRequest()}                             | ${{ error: new Error('Service Request Depth 10 Exceeded: Retry Again Request') }}
        ${new ServiceRequestCls('throw', undefined)}           | ${{ error: new Error('Unhandled Error in Handler: handlerThrowErrorOnRequest') }}
    `('serviceBus handle request: $request.type', ({ request, expected }) => {
        expect(bus.dispatch(request)).toEqual(expected);
    });
});
