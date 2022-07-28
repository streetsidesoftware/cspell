import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:readBinaryFile' as const;
interface RequestParams {
    readonly url: URL;
}
export const RequestFsReadBinaryFile = requestFactory<typeof RequestType, RequestParams, Promise<Buffer>>(RequestType);

const RequestTypeSync = 'fs:readBinaryFileSync' as const;
export const RequestFsReadBinaryFileSync = requestFactory<typeof RequestTypeSync, RequestParams, Buffer>(
    RequestTypeSync
);
