import { RequestResponseType, ServiceRequest } from './request';

export interface Dispatcher {
    dispatch<R extends ServiceRequest>(request: R): RequestResponseType<R>;
}
