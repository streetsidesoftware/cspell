import { assert } from './assert';
import type { RequestResponseType } from './request';
import { createResponse, createResponseFail, isServiceResponseFailure, isServiceResponseSuccess } from './request';
import type { ServiceRequestFactory } from './ServiceRequestFactory';
import { requestFactory } from './requestFactory';
import {
    createSystemServiceBus,
    RequestCreateSubsystemFactory,
    RequestRegisterHandlerFactory,
} from './SystemServiceBus';

const TypeRequestFsReadFile = 'fs:readFile' as const;
const RequestFsReadFile = requestFactory<typeof TypeRequestFsReadFile, { readonly uri: string }, string>(
    TypeRequestFsReadFile
);

const TypeRequestZlibInflate = 'zlib:inflate' as const;
const RequestZlibInflate = requestFactory<typeof TypeRequestZlibInflate, { readonly data: string }, string>(
    TypeRequestZlibInflate
);

const knownRequestTypes = {
    [RequestRegisterHandlerFactory.type]: RequestRegisterHandlerFactory,
    [RequestCreateSubsystemFactory.type]: RequestCreateSubsystemFactory,
    [RequestFsReadFile.type]: RequestFsReadFile,
    [RequestZlibInflate.type]: RequestZlibInflate,
} as const;

describe('SystemServiceBus', () => {
    test('createSystemServiceBus', () => {
        const bus = createSystemServiceBus();
        bus.createSubsystem('File System', 'fs:');
        bus.createSubsystem('ZLib', 'zlib:');
        bus.createSubsystem('Path', 'path:');
        expect(bus.subsystems).toMatchSnapshot();
    });

    test('ServiceRequestFactory Compliance', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const knownRequests: [string, ServiceRequestFactory<any>][] = Object.entries(knownRequestTypes);
        expect(knownRequests.map(([name, def]) => [name, def.type])).toMatchSnapshot();
    });
});

describe('SystemServiceBus Behavior', () => {
    const serviceBus = createSystemServiceBus();
    serviceBus.createSubsystem('File System', 'fs:');
    serviceBus.createSubsystem('ZLib', 'zlib:');
    serviceBus.createSubsystem('Path', 'path:');
    serviceBus.registerRequestHandler(RequestFsReadFile, (req) => createResponse(`read file: ${req.params.uri}`));
    serviceBus.registerRequestHandler(RequestFsReadFile, (req, next) =>
        /https?:/.test(req.params.uri) ? createResponse(`fetch http: ${req.params.uri}`) : next(req)
    );
    serviceBus.registerRequestHandler(
        RequestFsReadFile,
        (req, next, dispatcher) => {
            if (!req.params.uri.endsWith('.gz')) {
                return next(req);
            }
            const fileRes = next(req);
            if (!isServiceResponseSuccess<RequestResponseType<typeof RequestFsReadFile>>(fileRes)) return fileRes;
            const decompressRes = dispatcher.dispatch(RequestZlibInflate.create({ data: fileRes.value }));
            if (isServiceResponseFailure(decompressRes)) {
                return createResponseFail(req, decompressRes.error);
            }
            assert(decompressRes.value);
            return createResponse(decompressRes.value);
        },
        RequestFsReadFile.type + '/zip'
    );
    serviceBus.registerRequestHandler(RequestZlibInflate, (req) => createResponse(`Inflate: ${req.params.data}`));

    test.each`
        request                                                                         | expected
        ${RequestFsReadFile.create({ uri: 'file://my_file.txt' })}                      | ${{ value: 'read file: file://my_file.txt' }}
        ${RequestFsReadFile.create({ uri: 'https://www.example.com/my_file.txt' })}     | ${{ value: 'fetch http: https://www.example.com/my_file.txt' }}
        ${RequestFsReadFile.create({ uri: 'https://www.example.com/my_dict.trie.gz' })} | ${{ value: 'Inflate: fetch http: https://www.example.com/my_dict.trie.gz' }}
        ${{ type: 'zlib:compress' }}                                                    | ${{ error: Error('Unhandled Request: zlib:compress') }}
    `('dispatch requests', ({ request, expected }) => {
        expect(serviceBus.dispatch(request)).toEqual(expected);
    });
});
