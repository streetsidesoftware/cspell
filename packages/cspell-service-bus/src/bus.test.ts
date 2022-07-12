import { createRequestHandler, createServiceBus, Dispatcher, Handler } from './bus';
import { createResponse as response, ServiceRequest, ServiceRequestSync, ServiceResponse } from './request';

function calcFib(request: FibRequest): ServiceResponse<number> {
    let a = 0,
        b = 1;
    let n = request.fib;

    while (--n >= 0) {
        const c = a + b;
        a = b;
        b = c;
    }

    return {
        value: a,
    };
}

class FibRequest extends ServiceRequestSync<'calc-fib', number> {
    constructor(readonly fib: number) {
        super('calc-fib');
    }
    static is(req: ServiceRequest): req is FibRequest {
        return req instanceof FibRequest;
    }
}

class StringLengthRequest extends ServiceRequestSync<'calc-string-length', number> {
    constructor(readonly str: string) {
        super('calc-string-length');
    }
    static is(req: ServiceRequest): req is StringLengthRequest {
        return req instanceof StringLengthRequest;
    }
}

class StringToUpperRequest extends ServiceRequestSync<'toUpper', string> {
    constructor(readonly str: string) {
        super('toUpper');
    }
    static is(req: ServiceRequest): req is StringToUpperRequest {
        return req instanceof StringToUpperRequest;
    }
}

class DoNotHandleRequest extends ServiceRequestSync<'Do Not Handle', undefined> {
    constructor() {
        super('Do Not Handle');
    }
}

class RetryAgainRequest extends ServiceRequestSync<'Retry Again Request', undefined> {
    constructor() {
        super('Retry Again Request');
    }
    static is(req: ServiceRequest): req is RetryAgainRequest {
        return req instanceof RetryAgainRequest;
    }
}

const handlerStringLengthRequest = createRequestHandler(StringLengthRequest.is, (r) => response(r.str.length));
const handlerStringToUpperRequest = createRequestHandler(StringToUpperRequest.is, (r) =>
    response(r.str.toLocaleUpperCase())
);
const handlerRetryAgainRequest: Handler = (service: Dispatcher) => (next) => (request) =>
    RetryAgainRequest.is(request) ? service.dispatch(request) : next(request);

describe('Service Bus', () => {
    const bus = createServiceBus();
    bus.addHandler(createRequestHandler(FibRequest.is, calcFib));
    bus.addHandler(handlerStringLengthRequest);
    bus.addHandler(handlerStringToUpperRequest);
    bus.addHandler(handlerRetryAgainRequest);

    test.each`
        request                              | expected
        ${new FibRequest(6)}                 | ${response(8)}
        ${new FibRequest(5)}                 | ${response(5)}
        ${new FibRequest(7)}                 | ${response(13)}
        ${new StringLengthRequest('hello')}  | ${response(5)}
        ${new StringToUpperRequest('hello')} | ${response('HELLO')}
        ${new DoNotHandleRequest()}          | ${{ error: Error('Unhandled Request: Do Not Handle') }}
        ${new RetryAgainRequest()}           | ${{ error: Error('Service Request Depth 10 Exceeded: Retry Again Request') }}
    `('serviceBus handle request: $request.type', ({ request, expected }) => {
        expect(bus.dispatch(request)).toEqual(expected);
    });
});
