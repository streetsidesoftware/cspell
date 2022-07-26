import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:readBinaryFile' as const;
interface RequestParams {
    readonly filename: string;
}
export const RequestFsReadBinaryFile = requestFactory<typeof RequestType, RequestParams, Promise<Buffer>>(RequestType);
