import {
    createResponseFail,
    IsARequest,
    RequestResponseType,
    ServiceRequest,
    ServiceRequestFactory,
    ServiceRequestFactoryRequestType,
} from './request';

export interface Dispatcher {
    dispatch<R extends ServiceRequest>(request: R): RequestResponseType<R>;
}

const MAX_DEPTH = 10;

export class ServiceBus implements Dispatcher {
    readonly handlers: Handler[] = [];
    constructor(handlers: Handler[] = []) {
        handlers.forEach((h) => this.addHandler(h));
    }

    addHandler(handler: HandlerFn, name: string, description?: string): void;
    addHandler(handler: Handler): void;
    addHandler(handler: HandlerFn | Handler, name = 'anonymous', description?: string): void {
        const h = typeof handler === 'function' ? { fn: handler, name, description } : handler;
        const { fn, name: _name, description: _description } = h;
        this.handlers.push({ fn, name: _name, description: _description });
    }

    dispatch<R extends ServiceRequest>(request: R): RequestResponseType<R> {
        let depth = 0;
        const dispatcher: Dispatcher = { dispatch };
        const handler = this.reduceHandlers(this.handlers, request, dispatcher, this.defaultHandler);

        function dispatch<R extends ServiceRequest>(request: R): RequestResponseType<R> {
            type RR = R extends { __r?: infer R } ? R : never;
            ++depth;
            if (depth >= MAX_DEPTH) {
                return createResponseFail(request, new ErrorServiceRequestDepthExceeded(request, depth)) as RR;
            }
            const response = handler(request) as RR;
            --depth;
            return response;
        }
        return dispatch(request);
    }

    defaultHandler(request: ServiceRequest) {
        return createResponseFail(request, new ErrorUnhandledRequest(request));
    }

    protected reduceHandlers<R extends ServiceRequest>(
        handlers: readonly Handler[],
        request: R,
        dispatcher: Dispatcher,
        defaultHandler: HandleRequest
    ) {
        const _handlers = handlers.map((m) => ({ ...m, fn: m.fn(dispatcher) }));
        const handler = _handlers.reduce((next, h) => {
            const fn = h.fn(next);
            return (req) => {
                try {
                    return fn(req);
                } catch (e) {
                    return createResponseFail(request, new UnhandledHandlerError(h.name, h.description, e));
                }
            };
        }, defaultHandler);
        return handler;
    }
}

export function createServiceBus(handlers: Handler[] = []): ServiceBus {
    return new ServiceBus(handlers);
}

export type HandleRequestFn<R extends ServiceRequest> = (
    request: R,
    next: HandleRequest,
    dispatch: Dispatcher
) => RequestResponseType<R>;

export interface HandleRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <R extends ServiceRequest>(request: R): any;
}

export interface HandleRequestKnown<R extends ServiceRequest> {
    (request: R): RequestResponseType<R>;
}

export type FactoryRequestHandler<
    T extends ServiceRequestFactory<ServiceRequest>,
    R extends ServiceRequest = ServiceRequestFactoryRequestType<T>
> = HandleRequestKnown<R>;

export interface HandlerNext {
    (next: HandleRequest): HandleRequest;
}

export interface HandlerFn {
    (dispatcher: Dispatcher): HandlerNext;
}

export interface Handler {
    /**
     * Name of the Handler.
     * Useful for debugging and uncaught exceptions.
     */
    readonly name: string;
    /**
     * Optional description of the Handler.
     */
    readonly description?: string | undefined;
    readonly fn: HandlerFn;
}

export function createIsRequestHandlerFn<T extends ServiceRequest>(
    isA: IsARequest<T>,
    fn: HandleRequestFn<T>
): HandlerFn {
    return (dispatcher) => (next) => (request) => isA(request) ? fn(request, next, dispatcher) : next(request);
}

export function createIsRequestHandler<T extends ServiceRequest>(
    isA: IsARequest<T>,
    fn: HandleRequestFn<T>,
    name: string,
    description?: string
): Handler {
    return {
        fn: createIsRequestHandlerFn<T>(isA, fn),
        name,
        description,
    };
}

export function createRequestHandler<T extends ServiceRequest>(
    requestDef: ServiceRequestFactory<T>,
    fn: HandleRequestFn<T>,
    name?: string,
    description?: string
): Handler {
    return createIsRequestHandler(requestDef.is, fn, name ?? requestDef.type, description);
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

export class UnhandledHandlerError extends Error {
    constructor(
        readonly handlerName: string,
        readonly handlerDescription: string | undefined,
        readonly cause: unknown
    ) {
        super(`Unhandled Error in Handler: ${handlerName}`);
    }
}
