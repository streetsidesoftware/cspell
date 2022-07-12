export interface ServiceRequest<T = string, R = unknown> {
    readonly type: T;
    __r?: ServiceResponseBase<R>;
}

export class BaseServiceRequest<T extends string, R> implements ServiceRequest<T, R> {
    readonly __r?: ServiceResponseBase<R>;
    constructor(readonly type: T) {}
}

export class ServiceRequestSync<T extends string, R> extends BaseServiceRequest<T, R> {
    readonly sync = true;
    constructor(type: T) {
        super(type);
    }
}

export class ServiceRequestAsync<T extends string, R> extends BaseServiceRequest<T, R> {
    constructor(type: T) {
        super(type);
    }
}

interface ServiceResponseBase<T> {
    ___T?: T;
}

export interface ServiceResponseSuccess<T> extends ServiceResponseBase<T> {
    value: T;
    error?: undefined;
}

export interface ServiceResponseFailure<T> extends ServiceResponseBase<T> {
    error: Error;
}

export type ServiceResponse<T> = ServiceResponseSuccess<T> | ServiceResponseFailure<T>;

export type IsARequest<T extends ServiceRequest> = (r: ServiceRequest) => r is T;

export function createResponse<T>(value: T): ServiceResponseSuccess<T> {
    return { value };
}

type VT<T> = T extends { ___T?: infer R } ? R : never;

export type RequestResponseType<T> = T extends { __r?: infer R } ? R : never;

export function createResponseFail<R extends ServiceRequest, E extends Error>(
    _request: R,
    error: E
): ServiceResponseFailure<VT<RequestResponseType<R>>> {
    return { error };
}

export function isServiceResponseSuccess<T>(res: ServiceResponseBase<T>): res is ServiceResponseSuccess<T> {
    return 'value' in res && (<ServiceResponseFailure<T>>res).error === undefined;
}

export function isServiceResponseFailure<T>(res: ServiceResponseBase<T>): res is ServiceResponseFailure<T> {
    return (<ServiceResponseFailure<T>>res).error !== undefined;
}

export function isInstanceOfFn<T>(constructor: { new (): T }): (t: unknown) => t is T {
    return (t): t is T => t instanceof constructor;
}
