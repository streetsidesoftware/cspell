import type { RequestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { FileResourceRequest, TextFileResource } from '../models/FileResource.js';

const RequestType = 'fs:readFile' as const;
type RequestParams = FileResourceRequest;

export type RequestFsReadFileFactory = RequestFactory<typeof RequestType, RequestParams, Promise<TextFileResource>>;
export type RequestFsReadFile = ServiceRequestFactoryRequestType<RequestFsReadFileFactory>;
export const RequestFsReadFile: RequestFsReadFileFactory = requestFactory(RequestType);
