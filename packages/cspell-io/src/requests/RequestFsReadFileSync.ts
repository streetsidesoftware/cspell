import { requestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import type { TextFileResource } from '../models/FileResource';

const RequestType = 'fs:readFileSync' as const;
interface RequestParams {
    readonly url: URL;
    readonly encoding: BufferEncoding;
}
export const RequestFsReadFileSync = requestFactory<typeof RequestType, RequestParams, TextFileResource>(RequestType);
export type RequestFsReadFileSync = ServiceRequestFactoryRequestType<typeof RequestFsReadFileSync>;
