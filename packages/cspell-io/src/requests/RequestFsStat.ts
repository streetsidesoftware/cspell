import { requestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { Stats } from '../models';

const RequestTypeStat = 'fs:stat' as const;
interface RequestStatParams {
    readonly url: URL;
}
export const RequestFsStat = requestFactory<typeof RequestTypeStat, RequestStatParams, Promise<Stats>>(RequestTypeStat);
export type RequestFsStat = ServiceRequestFactoryRequestType<typeof RequestFsStat>;

const RequestTypeStatSync = 'fs:statSync' as const;
export const RequestFsStatSync = requestFactory<typeof RequestTypeStatSync, RequestStatParams, Stats>(
    RequestTypeStatSync
);
export type RequestFsStatSync = ServiceRequestFactoryRequestType<typeof RequestFsStatSync>;
