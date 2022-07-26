import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:readFile' as const;
interface RequestParams {
    readonly filename: string;
}
export const RequestFsReadFile = requestFactory<typeof RequestType, RequestParams, Promise<string>>(RequestType);
