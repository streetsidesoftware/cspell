import { requestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';

const RequestType = 'zlib:inflate' as const;
interface RequestParams {
    readonly data: Buffer;
}
export const RequestZlibInflate = requestFactory<typeof RequestType, RequestParams, string>(RequestType);
export type RequestZlibInflate = ServiceRequestFactoryRequestType<typeof RequestZlibInflate>;
