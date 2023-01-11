import type { Handler, HandleRequestFn, HandlerFn } from './handlers';
import type { IsARequest, ServiceRequest } from './request';
import type { ServiceRequestFactory } from './ServiceRequestFactory';

export function createRequestHandler<T extends ServiceRequest>(
    requestDef: ServiceRequestFactory<T>,
    fn: HandleRequestFn<T>,
    name?: string,
    description?: string
): Handler {
    return createIsRequestHandler(requestDef.is, fn, name ?? requestDef.type, description);
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
