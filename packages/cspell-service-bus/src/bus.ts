import { createResponseFail, IsARequest, RequestResponseType, ServiceRequest } from './request';

export interface Dispatcher {
    dispatch<R extends ServiceRequest>(request: R): R['__r'];
}

const MAX_DEPTH = 10;

export class ServiceBus implements Dispatcher {
    constructor(readonly handlers: Handler[]) {}

    addHandler(handler: Handler): void {
        this.handlers.push(handler);
    }

    dispatch<R extends ServiceRequest>(request: R): RequestResponseType<R> {
        type RR = RequestResponseType<R>;
        let depth = 0;
        const dispatcher: Dispatcher = {
            dispatch,
        };
        const unhandledHandler = (request: ServiceRequest): RR => {
            return createResponseFail(request, new ErrorUnhandledRequest(request)) as RR;
        };
        const handlers = this.handlers.reverse().map((m) => m(dispatcher));

        function dispatch<R extends ServiceRequest>(request: R): RR {
            ++depth;
            if (depth >= MAX_DEPTH) {
                return createResponseFail(request, new ErrorServiceRequestDepthExceeded(request, depth)) as RR;
            }
            const defaultHandler: HandleRequest = unhandledHandler;
            const handler = handlers.reduce((next, h) => h(next), defaultHandler);
            const response = handler(request) as RR;
            --depth;
            return response;
        }
        return dispatch(request);
    }
}

export function createServiceBus(handlers: Handler[] = []): ServiceBus {
    return new ServiceBus(handlers);
}

export type HandleRequestFn<R extends ServiceRequest> = (request: R) => RequestResponseType<R>;

export interface HandleRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <R extends ServiceRequest>(request: R): RequestResponseType<any>;
}

interface HandlerNext {
    (next: HandleRequest): HandleRequest;
}

export interface Handler {
    (dispatcher: Dispatcher): HandlerNext;
}

export function createRequestHandler<T extends ServiceRequest>(isA: IsARequest<T>, fn: HandleRequestFn<T>): Handler {
    return (_service) => (next) => (request) => isA(request) ? fn(request) : next(request);
}

export class ErrorUnhandledRequest extends Error {
    constructor(readonly request: ServiceRequest) {
        super(`Unhandled Request: ${request.type}`);
    }
}

export class ErrorServiceRequestDepthExceeded extends Error {
    constructor(readonly request: ServiceRequest, readonly depth: number) {
        super(`Service Request Depth ${depth} Exceeded: ${request.type}`);
    }
}
