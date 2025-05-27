import type { RequestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { DirEntry } from '../models/Stats.js';

const RequestType = 'fs:readDir' as const;
interface RequestParams {
    readonly url: URL;
}

export type RequestFsReadDirectoryFactory = RequestFactory<typeof RequestType, RequestParams, Promise<DirEntry[]>>;
export type RequestFsReadDirectory = ServiceRequestFactoryRequestType<RequestFsReadDirectoryFactory>;
export const RequestFsReadDirectory: RequestFsReadDirectoryFactory = requestFactory(RequestType);
