import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:readFileSync' as const;
interface RequestParams {
    readonly url: URL;
    readonly encoding: BufferEncoding;
}
export const RequestFsReadFileSync = requestFactory<typeof RequestType, RequestParams, string>(RequestType);
