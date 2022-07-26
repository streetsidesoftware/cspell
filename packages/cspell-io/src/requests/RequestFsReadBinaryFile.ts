import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:readBinaryFile' as const;
interface RequestParams {
    readonly url: URL;
}
export const RequestFsReadBinaryFile = requestFactory<typeof RequestType, RequestParams, Promise<Buffer>>(RequestType);
