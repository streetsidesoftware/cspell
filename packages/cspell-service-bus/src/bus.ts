import type { Dispatcher } from './Dispatcher';
import { ErrorServiceRequestDepthExceeded, ErrorUnhandledRequest, UnhandledHandlerError } from './errors';
import type { Handler, HandleRequest, HandlerFn } from './handlers';
import type { RequestResponseType, ServiceRequest } from './request';
import { createResponseFail } from './request';

const MAX_DEPTH = 10;

export class ServiceBus implements Dispatcher {
    readonly handlers: Handler[] = [];
    constructor(handlers: Handler[] = []) {
        handlers.forEach((h) => this.addHandler(h));
    }

    addHandler(handler: HandlerFn, name: string, description?: string): this;
    addHandler(handler: Handler): this;
    addHandler(handler: HandlerFn | Handler, name = 'anonymous', description?: string): this {
        const h = typeof handler === 'function' ? { fn: handler, name, description } : handler;
        const { fn, name: _name, description: _description } = h;
        this.handlers.push({ fn, name: _name, description: _description });
        return this;
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

    defaultHandler<T extends ServiceRequest>(request: T) {
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
