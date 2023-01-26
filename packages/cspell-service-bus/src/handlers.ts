import type { Dispatcher } from './Dispatcher.js';
import type { RequestResponseType, ServiceRequest } from './request.js';
import type { ServiceRequestFactory, ServiceRequestFactoryRequestType } from './ServiceRequestFactory.js';

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
