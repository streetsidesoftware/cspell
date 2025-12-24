import type { RequestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'zlib:inflate' as const;
interface RequestParams {
    readonly data: ArrayBufferView<ArrayBuffer>;
}

export type RequestZlibInflateFactory = RequestFactory<typeof RequestType, RequestParams, ArrayBufferView<ArrayBuffer>>;
export type RequestZlibInflate = ServiceRequestFactoryRequestType<RequestZlibInflateFactory>;
export const RequestZlibInflate: RequestZlibInflateFactory = requestFactory(RequestType);
