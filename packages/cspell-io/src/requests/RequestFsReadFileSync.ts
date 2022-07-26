import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:readFileSync' as const;
interface RequestParams {
    readonly filename: string;
}
export const RequestFsReadFile = requestFactory<typeof RequestType, RequestParams, string>(RequestType);
