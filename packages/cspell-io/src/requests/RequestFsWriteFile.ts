import type { ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { BufferEncoding } from '../models/BufferEncoding.js';

const RequestType = 'fs:writeFile' as const;
interface RequestParams {
    readonly url: URL;
    readonly content: string | ArrayBufferView;
    readonly encoding?: BufferEncoding | undefined;
}
export const RequestFsWriteFile = requestFactory<typeof RequestType, RequestParams, Promise<void>>(RequestType);
export type RequestFsWriteFile = ServiceRequestFactoryRequestType<typeof RequestFsWriteFile>;
