import { requestFactory } from '@cspell/cspell-service-bus';

const RequestType = 'fs:writeFile' as const;
interface RequestParams {
    readonly url: URL;
}
export const RequestFsWriteFile = requestFactory<typeof RequestType, RequestParams, Promise<void>>(RequestType);
