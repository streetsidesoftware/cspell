import type { ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { TextFileResource } from '../models/FileResource';

const RequestType = 'fs:readFile' as const;
interface RequestParams {
    readonly url: URL;
    readonly encoding: BufferEncoding;
}
export const RequestFsReadFile = requestFactory<typeof RequestType, RequestParams, Promise<TextFileResource>>(
    RequestType
);
export type RequestFsReadFile = ServiceRequestFactoryRequestType<typeof RequestFsReadFile>;
