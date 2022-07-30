import { Handler, HandleRequestFn } from './handlers';
import { ServiceRequest } from './request';

export interface ServiceRequestFactory<R extends ServiceRequest, P = R['params'], T extends string = R['type']> {
    type: T;
    is: (r: ServiceRequest | R) => r is R;
    create(params: P): R;
    createRequestHandler(fn: HandleRequestFn<R>, name?: string, description?: string): Handler;
    /**
     * Place holder property used to determine the request type. It is NEVER set.
     */
    __request?: R;
}

export type ServiceRequestFactoryRequestType<T> = T extends { __request?: infer R } ? R : never;
