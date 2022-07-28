import { requestFactory } from '@cspell/cspell-service-bus';
import { Stats } from '../models';

const RequestTypeStat = 'fs:stat' as const;
interface RequestStatParams {
    readonly url: URL;
}
export const RequestFsStat = requestFactory<typeof RequestTypeStat, RequestStatParams, Promise<Stats>>(RequestTypeStat);

const RequestTypeStatSync = 'fs:statSync' as const;
export const RequestFsStatSync = requestFactory<typeof RequestTypeStatSync, RequestStatParams, Stats>(
    RequestTypeStatSync
);
