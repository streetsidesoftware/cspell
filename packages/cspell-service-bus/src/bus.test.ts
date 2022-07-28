import { createIsRequestHandler, createRequestHandler, createServiceBus, Dispatcher, Handler } from './bus';
import { createResponse as response, ServiceRequest, ServiceResponse } from './request';

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
class FibRequest extends ServiceRequest<typeof TypeRequestFib, { readonly fib: number }, number> {
    static type = TypeRequestFib;
    private constructor(params: { fib: number }) {
        super(TypeRequestFib, params);
    }
    static is(req: ServiceRequest): req is FibRequest {
        return req instanceof FibRequest;
    }
    static create(params: { fib: number }) {
        return new FibRequest(params);
    }
}

class StringLengthRequest extends ServiceRequest<'calc-string-length', { readonly str: string }, number> {
    constructor(readonly str: string) {
        super('calc-string-length', { str });
    }
    static is(req: ServiceRequest): req is StringLengthRequest {
        return req instanceof StringLengthRequest;
    }
}

class StringToUpperRequest extends ServiceRequest<'toUpper', { readonly str: string }, string> {
    constructor(readonly str: string) {
        super('toUpper', { str });
    }
    static is(req: ServiceRequest): req is StringToUpperRequest {
        return req instanceof StringToUpperRequest;
    }
}

class DoNotHandleRequest extends ServiceRequest<'Do Not Handle', undefined, undefined> {
    constructor() {
        super('Do Not Handle', undefined);
    }
}

class RetryAgainRequest extends ServiceRequest<'Retry Again Request', undefined, undefined> {
    constructor() {
        super('Retry Again Request', undefined);
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
        ${FibRequest.create({ fib: 6 })}     | ${response(8)}
        ${FibRequest.create({ fib: 5 })}     | ${response(5)}
        ${FibRequest.create({ fib: 7 })}     | ${response(13)}
        ${new StringLengthRequest('hello')}  | ${response(5)}
        ${new StringToUpperRequest('hello')} | ${response('HELLO')}
        ${new DoNotHandleRequest()}          | ${{ error: Error('Unhandled Request: Do Not Handle') }}
        ${new RetryAgainRequest()}           | ${{ error: Error('Service Request Depth 10 Exceeded: Retry Again Request') }}
    `('serviceBus handle request: $request.type', ({ request, expected }) => {
        expect(bus.dispatch(request)).toEqual(expected);
    });
});
