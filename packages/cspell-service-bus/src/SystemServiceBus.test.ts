import { assert } from './assert';
import {
    createResponse,
    createResponseFail,
    isServiceResponseFailure,
    isServiceResponseSuccess,
    ServiceRequest,
    ServiceRequestFactory,
} from './request';
import {
    createSystemServiceBus,
    RequestCreateSubsystemFactory,
    RequestRegisterHandlerFactory,
} from './SystemServiceBus';

const TypeRequestFsReadFile = 'fs:readFile' as const;
class RequestFsReadFile extends ServiceRequest<typeof TypeRequestFsReadFile, string> {
    static type = TypeRequestFsReadFile;
    private constructor(readonly uri: string) {
        super(TypeRequestFsReadFile);
    }
    static is(req: ServiceRequest): req is RequestFsReadFile {
        return req instanceof RequestFsReadFile;
    }
    static create(uri: string) {
        return new RequestFsReadFile(uri);
    }
}

const TypeRequestZlibInflate = 'zlib:inflate' as const;
class RequestZlibInflate extends ServiceRequest<typeof TypeRequestZlibInflate, string> {
    static type = TypeRequestZlibInflate;
    private constructor(readonly data: string) {
        super(TypeRequestZlibInflate);
    }
    static is(req: ServiceRequest): req is RequestZlibInflate {
        return req instanceof RequestZlibInflate;
    }
    static create(data: string) {
        return new RequestZlibInflate(data);
    }
}

const knownRequestTypes = {
    [RequestRegisterHandlerFactory.type]: RequestRegisterHandlerFactory,
    [RequestCreateSubsystemFactory.type]: RequestCreateSubsystemFactory,
    [RequestFsReadFile.type]: RequestFsReadFile,
    [RequestZlibInflate.type]: RequestZlibInflate,
};

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
    serviceBus.registerRequestHandler(RequestFsReadFile, (req) => createResponse(`read file: ${req.uri}`));
    serviceBus.registerRequestHandler(RequestFsReadFile, (req, next) =>
        /https?:/.test(req.uri) ? createResponse(`fetch http: ${req.uri}`) : next(req)
    );
    serviceBus.registerRequestHandler(
        RequestFsReadFile,
        (req, next, dispatcher) => {
            if (!req.uri.endsWith('.gz')) {
                return next(req);
            }
            const fileRes = next(req);
            if (!isServiceResponseSuccess(fileRes)) return fileRes;
            const decompressRes = dispatcher.dispatch(RequestZlibInflate.create(fileRes.value));
            if (isServiceResponseFailure(decompressRes)) {
                return createResponseFail(RequestFsReadFile, decompressRes.error);
            }
            assert(decompressRes.value);
            return createResponse(decompressRes.value);
        },
        RequestFsReadFile.type + '/zip'
    );
    serviceBus.registerRequestHandler(RequestZlibInflate, (req) => createResponse(`Inflate: ${req.data}`));

    test.each`
        request                                                                | expected
        ${RequestFsReadFile.create('file://my_file.txt')}                      | ${{ value: 'read file: file://my_file.txt' }}
        ${RequestFsReadFile.create('https://www.example.com/my_file.txt')}     | ${{ value: 'fetch http: https://www.example.com/my_file.txt' }}
        ${RequestFsReadFile.create('https://www.example.com/my_dict.trie.gz')} | ${{ value: 'Inflate: fetch http: https://www.example.com/my_dict.trie.gz' }}
        ${{ type: 'zlib:compress' }}                                           | ${{ error: Error('Unhandled Request: zlib:compress') }}
    `('dispatch requests', ({ request, expected }) => {
        expect(serviceBus.dispatch(request)).toEqual(expected);
    });
});
