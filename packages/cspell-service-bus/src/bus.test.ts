import { createServiceBus } from './bus';
import { Dispatcher } from './Dispatcher';
import { Handler } from './handlers';
import { createIsRequestHandler } from './createRequestHandler';
import { createResponse as response, ServiceRequest, ServiceResponse } from './request';
import { requestFactory } from './requestFactory';
import { ServiceRequestFactoryRequestType } from './ServiceRequestFactory';
import { nextTick } from 'process';

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
    'calc-string-length'
);

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
    StringLengthRequestFactory.is,
    (r) => response(r.params.str.length),
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
        ${new DoNotHandleRequest()}                            | ${{ error: Error('Unhandled Request: Do Not Handle') }}
        ${new RetryAgainRequest()}                             | ${{ error: Error('Service Request Depth 10 Exceeded: Retry Again Request') }}
        ${new ServiceRequest('throw', undefined)}              | ${{ error: Error('Unhandled Error in Handler: handlerThrowErrorOnRequest') }}
    `('serviceBus handle request: $request.type', ({ request, expected }) => {
        expect(bus.dispatch(request)).toEqual(expected);
    });
});
