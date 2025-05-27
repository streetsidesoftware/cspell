import type { RequestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { Stats } from '../models/index.js';

const RequestTypeStat = 'fs:stat' as const;
interface RequestStatParams {
    readonly url: URL;
}
export type RequestFsStat = RequestFactory<typeof RequestTypeStat, RequestStatParams, Promise<Stats>>;
export const RequestFsStat: RequestFsStat = requestFactory(RequestTypeStat);

const RequestTypeStatSync = 'fs:statSync' as const;
export type RequestFsStatSyncFactory = RequestFactory<typeof RequestTypeStatSync, RequestStatParams, Stats>;
export type RequestFsStatSync = ServiceRequestFactoryRequestType<RequestFsStatSyncFactory>;
export const RequestFsStatSync: RequestFsStatSyncFactory = requestFactory(RequestTypeStatSync);
