import { createRequestHandler, ServiceBus, createResponse, isServiceResponseSuccess } from '@cspell/cspell-service-bus';
import { RequestFsReadBinaryFile, RequestFsReadFile, RequestZlibInflate } from '../../requests';
import { promises as fs } from 'fs';
import { deflateSync } from 'zlib';
import { isZipped } from '../../node/file/util';

/**
 * Handle Binary File Reads
 */
const handleRequestFsReadBinaryFile = createRequestHandler(
    RequestFsReadBinaryFile,
    ({ params }) => createResponse(fs.readFile(params.filename)),
    undefined,
    'Node: Read Binary File.'
);

const handleRequestFsReadFile = createRequestHandler(
    RequestFsReadFile,
    ({ params }) => createResponse(fs.readFile(params.filename, 'utf-8')),
    RequestFsReadFile.type,
    'Node: Read Text File.'
);

const handleRequestZlibInflate = createRequestHandler(
    RequestZlibInflate,
    ({ params }) => createResponse(deflateSync(params.data).toString('utf-8')),
    RequestZlibInflate.type,
    'Node: gz deflate.'
);

const handleRequestFsReadFileGz = createRequestHandler(
    RequestFsReadFile,
    (req, next, dispatcher) => {
        const { filename } = req.params;
        if (!isZipped(filename)) return next(req);
        const result = dispatcher.dispatch(RequestFsReadBinaryFile.create({ filename }));
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
