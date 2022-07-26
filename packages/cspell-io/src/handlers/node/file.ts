import {
    createRequestHandler,
    ServiceBus,
    createResponse,
    isServiceResponseSuccess,
    createResponseFail,
    isServiceResponseFailure,
} from '@cspell/cspell-service-bus';
import { RequestFsReadBinaryFile, RequestFsReadFile, RequestZlibInflate } from '../../requests';
import { promises as fs } from 'fs';
import { deflateSync } from 'zlib';
import { isZipped } from '../../node/file/util';
import assert from 'assert';

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
        return createResponse(res.value.then((buf) => buf.toString('utf-8')));
    },
    RequestFsReadFile.type,
    'Node: Read Text File.'
);

/**
 * Handle deflating gzip data
 */
const handleRequestZlibInflate = createRequestHandler(
    RequestZlibInflate,
    ({ params }) => createResponse(deflateSync(params.data).toString('utf-8')),
    RequestZlibInflate.type,
    'Node: gz deflate.'
);

/**
 * Handle reading gzip'ed text files.
 */
const handleRequestFsReadFileGz = createRequestHandler(
    RequestFsReadFile,
    (req, next, dispatcher) => {
        const { url } = req.params;
        if (!isZipped(url)) return next(req);
        const result = dispatcher.dispatch(RequestFsReadBinaryFile.create({ url }));
        return isServiceResponseSuccess(result)
            ? createResponse(result.value.then((buf) => deflateSync(buf).toString('utf-8')))
            : result;
    },
    undefined,
    'Node: Read GZ Text File.'
);

export function registerHandlers(serviceBus: ServiceBus) {
    /**
     * Handlers are in order of low to high level
     * Order is VERY important.
     */
    const handlers = [
        handleRequestFsReadBinaryFile,
        handleRequestFsReadFile,
        handleRequestZlibInflate,
        handleRequestFsReadFileGz,
    ];

    handlers.forEach((handler) => serviceBus.addHandler(handler));
}
