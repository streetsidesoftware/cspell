import type { ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { DirEntry } from '../models/Stats.js';

const RequestType = 'fs:readDir' as const;
interface RequestParams {
    readonly url: URL;
}

export const RequestFsReadDirectory = requestFactory<typeof RequestType, RequestParams, Promise<DirEntry[]>>(
    RequestType,
);
export type RequestFsReadDirectory = ServiceRequestFactoryRequestType<typeof RequestFsReadDirectory>;
