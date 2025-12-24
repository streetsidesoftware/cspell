import type { RequestFactory, ServiceRequestFactoryRequestType } from '@cspell/cspell-service-bus';
import { requestFactory } from '@cspell/cspell-service-bus';

import type { FileReference } from '../models/FileResource.js';

const RequestType = 'fs:writeFile' as const;
interface RequestParams extends FileReference {
    readonly content: string | ArrayBufferView<ArrayBuffer>;
}
export type RequestFsWriteFileFactory = RequestFactory<typeof RequestType, RequestParams, Promise<FileReference>>;
export type RequestFsWriteFile = ServiceRequestFactoryRequestType<RequestFsWriteFileFactory>;
export const RequestFsWriteFile: RequestFsWriteFileFactory = requestFactory(RequestType);
