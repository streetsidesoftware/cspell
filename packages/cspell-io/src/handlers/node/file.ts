import type { ServiceBus } from '@cspell/cspell-service-bus';
import { createResponse, createResponseFail, isServiceResponseSuccess } from '@cspell/cspell-service-bus';
import { promises as fs, readFileSync, statSync } from 'fs';
import type { URL } from 'url';
import { fileURLToPath } from 'url';
import { gunzipSync, gzipSync } from 'zlib';

import { arrayBufferViewToBuffer } from '../../common/arrayBuffers.js';
import { encodeString } from '../../common/encode-decode.js';
import { toError } from '../../errors/index.js';
import { CFileResource } from '../../index.js';
import type { FileResourceBase } from '../../models/FileResource.js';
import { decodeDataUrl } from '../../node/dataUrl.js';
import { fetchURL } from '../../node/file/fetch.js';
import { getStatHttp } from '../../node/file/stat.js';
import {
    RequestFsReadFile,
    RequestFsReadFileSync,
    RequestFsStat,
    RequestFsStatSync,
    RequestFsWriteFile,
    RequestZlibInflate,
} from '../../requests/index.js';

const isGzFileRegExp = /\.gz($|[?#])/;

function isGzFile(url: URL): boolean {
    return isGzFileRegExp.test(url.pathname);
}

/*
 * NOTE: fileURLToPath is used because of yarn bug https://github.com/yarnpkg/berry/issues/899
 */

/**
 * Handle Binary File Reads
 */
const handleRequestFsReadFile = RequestFsReadFile.createRequestHandler(
    ({ params }) =>
        createResponse(
            fs.readFile(fileURLToPath(params.url)).then((content) => CFileResource.from(params.url, content)),
        ),
    undefined,
    'Node: Read Binary File.',
);

/**
 * Handle Binary File Sync Reads
 */
const handleRequestFsReadFileSync = RequestFsReadFileSync.createRequestHandler(
    ({ params }) => createResponse(CFileResource.from({ ...params, content: readFileSync(fileURLToPath(params.url)) })),
    undefined,
    'Node: Sync Read Binary File.',
);

/**
 * Handle deflating gzip data
 */
const handleRequestZlibInflate = RequestZlibInflate.createRequestHandler(
    ({ params }) => createResponse(gunzipSync(arrayBufferViewToBuffer(params.data))),
    undefined,
    'Node: gz deflate.',
);

const supportedFetchProtocols: Record<string, true | undefined> = { 'http:': true, 'https:': true };

/**
 * Handle fetching a file from http
 */
const handleRequestFsReadFileHttp = RequestFsReadFile.createRequestHandler(
    (req: RequestFsReadFile, next) => {
        const { url } = req.params;
        if (!(url.protocol in supportedFetchProtocols)) return next(req);
        return createResponse(fetchURL(url).then((content) => CFileResource.from({ ...req.params, content })));
    },
    undefined,
    'Node: Read Http(s) file.',
);

/**
 * Handle decoding a data url
 */
const handleRequestFsReadFileSyncData = RequestFsReadFileSync.createRequestHandler(
    (req: RequestFsReadFileSync, next) => {
        const { url, encoding } = req.params;
        if (url.protocol !== 'data:') return next(req);
        const data = decodeDataUrl(url);
        return createResponse(
            CFileResource.from({ url, content: data.data, encoding, baseFilename: data.attributes.get('filename') }),
        );
    },
    undefined,
    'Node: Read data: urls.',
);

/**
 * Handle decoding a data url
 */
const handleRequestFsReadFileData = RequestFsReadFile.createRequestHandler(
    (req: RequestFsReadFile, next, dispatcher) => {
        const { url } = req.params;
        if (url.protocol !== 'data:') return next(req);
        const res = dispatcher.dispatch(RequestFsReadFileSync.create(req.params));
        if (!isServiceResponseSuccess(res)) return res;
        return createResponse(Promise.resolve(res.value));
    },
    undefined,
    'Node: Read data: urls.',
);

/**
 * Handle fs:stat
 */
const handleRequestFsStat = RequestFsStat.createRequestHandler(
    ({ params }) => createResponse(fs.stat(fileURLToPath(params.url))),
    undefined,
    'Node: fs.stat.',
);

/**
 * Handle fs:statSync
 */
const handleRequestFsStatSync = RequestFsStatSync.createRequestHandler(
    (req) => {
        const { params } = req;
        try {
            return createResponse(statSync(fileURLToPath(params.url)));
        } catch (e) {
            return createResponseFail(req, toError(e));
        }
    },
    undefined,
    'Node: fs.stat.',
);

/**
 * Handle deflating gzip data
 */
const handleRequestFsStatHttp = RequestFsStat.createRequestHandler(
    (req, next) => {
        const { url } = req.params;
        if (!(url.protocol in supportedFetchProtocols)) return next(req);
        return createResponse(getStatHttp(url));
    },
    undefined,
    'Node: http get stat',
);

/**
 * Handle fs:writeFile
 */
const handleRequestFsWriteFile = RequestFsWriteFile.createRequestHandler(
    ({ params }) => createResponse(fs.writeFile(params.url, extractData(params))),
    undefined,
    'Node: fs.writeFile',
);

/**
 * Handle fs:writeFile compressed
 */
const handleRequestFsWriteFileGz = RequestFsWriteFile.createRequestHandler(
    (req, next) => {
        const { url } = req.params;
        if (!isGzFile(url)) return next(req);
        return createResponse(fs.writeFile(url, gzipSync(extractData(req.params))));
    },
    undefined,
    'Node: http get stat',
);

export function registerHandlers(serviceBus: ServiceBus) {
    /**
     * Handlers are in order of low to high level
     * Order is VERY important.
     */
    const handlers = [
        handleRequestFsReadFile,
        handleRequestFsReadFileSync,
        handleRequestFsWriteFile,
        handleRequestFsWriteFileGz,
        handleRequestFsReadFileHttp,
        handleRequestFsReadFileData,
        handleRequestFsReadFileSyncData,
        handleRequestZlibInflate,
        handleRequestFsStatSync,
        handleRequestFsStat,
        handleRequestFsStatHttp,
    ];

    handlers.forEach((handler) => serviceBus.addHandler(handler));
}

function extractData(resource: FileResourceBase): string | Buffer {
    if (typeof resource.content === 'string') {
        if (!resource.encoding || resource.encoding === 'utf-8') return resource.content;
        return arrayBufferViewToBuffer(encodeString(resource.content, resource.encoding));
    }
    return arrayBufferViewToBuffer(resource.content);
}
