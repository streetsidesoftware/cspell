import { ServiceRequest, ServiceRequestFactory } from './request';

export function requestFactory<T extends string, P, R>(requestType: T): ServiceRequestFactory<ServiceRequest<T, P, R>> {
    type Request = ServiceRequest<T, P, R>;
    class RequestClass extends ServiceRequest<T, P, R> {
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
        static __request__?: Request;
    }
    return RequestClass;
}
