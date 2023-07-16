import type {
    Dispatcher,
    Handler,
    ServiceBus,
    ServiceRequest,
    ServiceRequestFactoryRequestType,
    ServiceResponse,
} from '@cspell/cspell-service-bus';
import {
    createIsRequestHandler,
    createResponse,
    createServiceBus,
    requestFactory,
    ServiceRequestCls,
} from '@cspell/cspell-service-bus';
import { assert } from 'console';

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
export const FibRequestFactory = requestFactory<typeof TypeRequestFib, { readonly fib: number }, number>(
    TypeRequestFib,
);
type FibRequestFactory = typeof FibRequestFactory;
type FibRequest = ServiceRequestFactoryRequestType<FibRequestFactory>;

export const StringLengthRequestFactory = requestFactory<'calc-string-length', { readonly str: string }, number>(
    'calc-string-length',
);

export class StringToUpperRequest extends ServiceRequestCls<'toUpper', { readonly str: string }, string> {
    constructor(readonly str: string) {
        super('toUpper', { str });
    }
    static is(req: ServiceRequest): req is StringToUpperRequest {
        return req instanceof StringToUpperRequest;
    }
}

export class DoNotHandleRequest extends ServiceRequestCls<'Do Not Handle', undefined, undefined> {
    constructor() {
        super('Do Not Handle', undefined);
    }
}

export class RetryAgainRequest extends ServiceRequestCls<'Retry Again Request', undefined, undefined> {
    constructor() {
        super('Retry Again Request', undefined);
    }
    static is(req: ServiceRequest): req is RetryAgainRequest {
        return req instanceof RetryAgainRequest;
    }
}

const handlerStringLengthRequest = createIsRequestHandler(
    StringLengthRequestFactory.is,
    (r) => createResponse(r.params.str.length),
    'handlerStringLengthRequest',
);
const handlerStringToUpperRequest = createIsRequestHandler(
    StringToUpperRequest.is,
    (r) => createResponse(r.str.toLocaleUpperCase()),
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

export function createBus(): ServiceBus {
    const bus = createServiceBus();
    bus.addHandler(handlerThrowErrorOnRequest)
        .addHandler(FibRequestFactory.createRequestHandler(calcFib))
        .addHandler(handlerStringLengthRequest)
        .addHandler(handlerStringToUpperRequest)
        .addHandler(handlerRetryAgainRequest);
    return bus;
}

export function smokeTest() {
    const tests = [
        { request: FibRequestFactory.create({ fib: 6 }), expected: createResponse(8) },
        { request: FibRequestFactory.create({ fib: 5 }), expected: createResponse(5) },
        { request: FibRequestFactory.create({ fib: 7 }), expected: createResponse(13) },
        { request: StringLengthRequestFactory.create({ str: 'hello' }), expected: createResponse(5) },
    ] as const;

    const bus = createBus();

    for (const t of tests) {
        assert(bus.dispatch(t.request).value === t.expected.value);
    }
    return true;
}
