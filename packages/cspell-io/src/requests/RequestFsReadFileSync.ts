import type { ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { TextFileResource } from '../models/FileResource.js';

const RequestType = 'fs:readFileSync' as const;
interface RequestParams {
    readonly url: URL;
    readonly encoding: BufferEncoding;
}
export const RequestFsReadFileTextSync = requestFactory<typeof RequestType, RequestParams, TextFileResource>(
    RequestType,
);
export type RequestFsReadFileTextSync = ServiceRequestFactoryRequestType<typeof RequestFsReadFileTextSync>;
