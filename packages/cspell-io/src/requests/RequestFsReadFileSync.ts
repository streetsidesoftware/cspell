import type { RequestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { TextFileResource } from '../models/FileResource.js';

const RequestType = 'fs:readFileSync' as const;
interface RequestParams {
    readonly url: URL;
    readonly encoding?: BufferEncoding | undefined;
}
export type RequestFsReadFileTextSyncFactory = RequestFactory<typeof RequestType, RequestParams, TextFileResource>;
export type RequestFsReadFileTextSync = ServiceRequestFactoryRequestType<RequestFsReadFileTextSyncFactory>;
export const RequestFsReadFileTextSync: RequestFsReadFileTextSyncFactory = requestFactory(RequestType);
