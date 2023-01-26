import { createRequestHandler } from './createRequestHandler.js';
import type { Handler, HandleRequestFn } from './handlers.js';
import type { ServiceRequest } from './request.js';
import { ServiceRequestCls } from './request.js';
import type { ServiceRequestFactory } from './ServiceRequestFactory.js';

export function requestFactory<T extends string, P, R>(requestType: T): ServiceRequestFactory<ServiceRequest<T, P, R>> {
    type Request = ServiceRequestCls<T, P, R>;
    class RequestClass extends ServiceRequestCls<T, P, R> {
        static type = requestType;
        private constructor(params: P) {
            super(requestType, params);
        }
        static is(req: ServiceRequest): req is RequestClass {
            return req instanceof RequestClass && req.type === requestType;
        }
        static create(params: P) {
            return new RequestClass(params);
        }
        static createRequestHandler(fn: HandleRequestFn<Request>, name?: string, description?: string): Handler {
            return createRequestHandler(RequestClass, fn, name, description);
        }
        static __request?: Request;
    }
    return RequestClass;
}
