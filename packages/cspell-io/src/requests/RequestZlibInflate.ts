import type { ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'zlib:inflate' as const;
interface RequestParams {
    readonly data: ArrayBufferView;
}
export const RequestZlibInflate = requestFactory<typeof RequestType, RequestParams, ArrayBufferView>(RequestType);
export type RequestZlibInflate = ServiceRequestFactoryRequestType<typeof RequestZlibInflate>;
