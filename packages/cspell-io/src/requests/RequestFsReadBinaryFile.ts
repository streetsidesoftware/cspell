import { requestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import type { BinaryFileResource } from '../models/FileResource';

const RequestType = 'fs:readBinaryFile' as const;
interface RequestParams {
    readonly url: URL;
}
export const RequestFsReadBinaryFile = requestFactory<typeof RequestType, RequestParams, Promise<BinaryFileResource>>(
    RequestType
);
export type RequestFsReadBinaryFile = ServiceRequestFactoryRequestType<typeof RequestFsReadBinaryFile>;

const RequestTypeSync = 'fs:readBinaryFileSync' as const;
export const RequestFsReadBinaryFileSync = requestFactory<typeof RequestTypeSync, RequestParams, BinaryFileResource>(
    RequestTypeSync
);
export type RequestFsReadBinaryFileSync = ServiceRequestFactoryRequestType<typeof RequestFsReadBinaryFileSync>;
