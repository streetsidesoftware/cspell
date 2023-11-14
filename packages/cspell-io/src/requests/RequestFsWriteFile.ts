import type { ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { FileReference } from '../models/FileResource.js';

const RequestType = 'fs:writeFile' as const;
interface RequestParams extends FileReference {
    readonly content: string | ArrayBufferView;
}
export const RequestFsWriteFile = requestFactory<typeof RequestType, RequestParams, Promise<FileReference>>(
    RequestType,
);
export type RequestFsWriteFile = ServiceRequestFactoryRequestType<typeof RequestFsWriteFile>;
