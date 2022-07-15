import { createIsRequestHandler, createRequestHandler, createServiceBus, Dispatcher, Handler, HandlerFn } from './bus';
import { createResponse as response, ServiceRequest, ServiceResponse } from './request';

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

const TypeRequestFib = 'Computations:calc-fib' as const;
class FibRequest extends ServiceRequest<typeof TypeRequestFib, number> {
    static type = TypeRequestFib;
    private constructor(readonly fib: number) {
        super(TypeRequestFib);
    }
    static is(req: ServiceRequest): req is FibRequest {
        return req instanceof FibRequest;
    }
    static create(fib: number) {
        return new FibRequest(fib);
    }
}

class StringLengthRequest extends ServiceRequest<'calc-string-length', number> {
    constructor(readonly str: string) {
        super('calc-string-length');
    }
    static is(req: ServiceRequest): req is StringLengthRequest {
        return req instanceof StringLengthRequest;
    }
}

class StringToUpperRequest extends ServiceRequest<'toUpper', string> {
    constructor(readonly str: string) {
        super('toUpper');
    }
    static is(req: ServiceRequest): req is StringToUpperRequest {
        return req instanceof StringToUpperRequest;
    }
}

class DoNotHandleRequest extends ServiceRequest<'Do Not Handle', undefined> {
    constructor() {
        super('Do Not Handle');
    }
}

class RetryAgainRequest extends ServiceRequest<'Retry Again Request', undefined> {
    constructor() {
        super('Retry Again Request');
    }
    static is(req: ServiceRequest): req is RetryAgainRequest {
        return req instanceof RetryAgainRequest;
    }
}

const handlerStringLengthRequest = createIsRequestHandler(
    StringLengthRequest.is,
    (r) => response(r.str.length),
    'handlerStringLengthRequest'
);
const handlerStringToUpperRequest = createIsRequestHandler(
    StringToUpperRequest.is,
    (r) => response(r.str.toLocaleUpperCase()),
    'handlerStringToUpperRequest'
);
const handlerRetryAgainRequest: Handler = {
    fn: (service: Dispatcher) => (next) => (request) =>
        RetryAgainRequest.is(request) ? service.dispatch(request) : next(request),
    name: 'handlerRetryAgainRequest',
};
describe('Service Bus', () => {
    const bus = createServiceBus();
    bus.addHandler(createRequestHandler(FibRequest, calcFib));
    bus.addHandler(handlerStringLengthRequest);
    bus.addHandler(handlerStringToUpperRequest);
    bus.addHandler(handlerRetryAgainRequest);

    test.each`
        request                              | expected
        ${FibRequest.create(6)}              | ${response(8)}
        ${FibRequest.create(5)}              | ${response(5)}
        ${FibRequest.create(7)}              | ${response(13)}
        ${new StringLengthRequest('hello')}  | ${response(5)}
        ${new StringToUpperRequest('hello')} | ${response('HELLO')}
        ${new DoNotHandleRequest()}          | ${{ error: Error('Unhandled Request: Do Not Handle') }}
        ${new RetryAgainRequest()}           | ${{ error: Error('Service Request Depth 10 Exceeded: Retry Again Request') }}
    `('serviceBus handle request: $request.type', ({ request, expected }) => {
        expect(bus.dispatch(request)).toEqual(expected);
    });
});
