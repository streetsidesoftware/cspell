import {
    createRequestHandler,
    createResponse,
    createResponseFail,
    isServiceResponseFailure,
    isServiceResponseSuccess,
    ServiceBus,
} from '@cspell/cspell-service-bus';
import assert from 'assert';
import { promises as fs, readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import { fetchURL } from '../../node/file/fetch';
import {
    RequestFsReadBinaryFile,
    RequestFsReadBinaryFileSync,
    RequestFsReadFile,
    RequestFsReadFileSync,
    RequestZlibInflate,
} from '../../requests';

/**
 * Handle Binary File Reads
 */
const handleRequestFsReadBinaryFile = createRequestHandler(
    RequestFsReadBinaryFile,
    ({ params }) => createResponse(fs.readFile(params.url)),
    undefined,
    'Node: Read Binary File.'
);

/**
 * Handle Binary File Sync Reads
 */
const handleRequestFsReadBinaryFileSync = createRequestHandler(
    RequestFsReadBinaryFileSync,
    ({ params }) => createResponse(readFileSync(params.url)),
    undefined,
    'Node: Sync Read Binary File.'
);

/**
 * Handle UTF-8 Text File Reads
 */
const handleRequestFsReadFile = createRequestHandler(
    RequestFsReadFile,
    (req, _, dispatcher) => {
        const { url } = req.params;
        const res = dispatcher.dispatch(RequestFsReadBinaryFile.create({ url }));
        if (!isServiceResponseSuccess(res)) {
            assert(isServiceResponseFailure(res));
            return createResponseFail(req, res.error);
        }
        return createResponse(res.value.then((buf) => bufferToText(buf)));
    },
    undefined,
    'Node: Read Text File.'
);

/**
 * Handle UTF-8 Text File Reads
 */
const handleRequestFsReadFileSync = createRequestHandler(
    RequestFsReadFileSync,
    (req, _, dispatcher) => {
        const { url } = req.params;
        const res = dispatcher.dispatch(RequestFsReadBinaryFileSync.create({ url }));
        if (!isServiceResponseSuccess(res)) {
            assert(isServiceResponseFailure(res));
            return createResponseFail(req, res.error);
        }
        return createResponse(bufferToText(res.value));
    },
    undefined,
    'Node: Sync Read Text File.'
);

/**
 * Handle deflating gzip data
 */
const handleRequestZlibInflate = createRequestHandler(
    RequestZlibInflate,
    ({ params }) => createResponse(gunzipSync(params.data).toString('utf-8')),
    undefined,
    'Node: gz deflate.'
);

const supportedFetchProtocols: Record<string, true | undefined> = { 'http:': true, 'https:': true };

/**
 * Handle reading gzip'ed text files.
 */
const handleRequestFsReadBinaryFileHttp = createRequestHandler(
    RequestFsReadBinaryFile,
    (req, next) => {
        const { url } = req.params;
        if (!(url.protocol in supportedFetchProtocols)) return next(req);
        return createResponse(fetchURL(url));
    },
    undefined,
    'Node: Read Http(s) file.'
);

function bufferToText(buf: Buffer): string {
    return buf[0] === 0x1f && buf[1] === 0x8b ? bufferToText(gunzipSync(buf)) : buf.toString('utf-8');
}

export function registerHandlers(serviceBus: ServiceBus) {
    /**
     * Handlers are in order of low to high level
     * Order is VERY important.
     */
    const handlers = [
        handleRequestFsReadBinaryFile,
        handleRequestFsReadBinaryFileSync,
        handleRequestFsReadBinaryFileHttp,
        handleRequestFsReadFile,
        handleRequestFsReadFileSync,
        handleRequestZlibInflate,
    ];

    handlers.forEach((handler) => serviceBus.addHandler(handler));
}
