import type { Dispatcher, ServiceBus } from '@cspell/cspell-service-bus';
import { createResponse, createResponseFail, isServiceResponseSuccess } from '@cspell/cspell-service-bus';
import { promises as fs, readFileSync, statSync } from 'fs';
import type { URL } from 'url';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { gunzipSync, gzip } from 'zlib';

import { arrayBufferViewToBuffer } from '../../common/arrayBuffers.js';
import { encodeString, isGZipped } from '../../common/encode-decode.js';
import { assert } from '../../errors/assert.js';
import { toError } from '../../errors/index.js';
import { CFileResource } from '../../index.js';
import type { FileReference } from '../../models/FileResource.js';
import { decodeDataUrl, guessMimeType, toDataUrl } from '../../node/dataUrl.js';
import { fetchURL } from '../../node/file/fetch.js';
import { getStatHttp } from '../../node/file/stat.js';
import { urlBasename } from '../../node/file/url.js';
import {
    RequestFsReadFile,
    RequestFsReadFileSync,
    RequestFsStat,
    RequestFsStatSync,
    RequestFsWriteFile,
    RequestZlibInflate,
} from '../../requests/index.js';

const isGzFileRegExp = /\.gz($|[?#])/;

function isGzFile(url: URL | string): boolean {
    return isGzFileRegExp.test(typeof url === 'string' ? url : url.pathname);
}

const pGzip = promisify(gzip);

/*
 * NOTE: fileURLToPath is used because of yarn bug https://github.com/yarnpkg/berry/issues/899
 */

/**
 * Handle Binary File Reads
 */
const handleRequestFsReadFile = RequestFsReadFile.createRequestHandler(
    ({ params }) => {
        const baseFilename = urlBasename(params.url);
        return createResponse(
            fs
                .readFile(fileURLToPath(params.url))
                .then((content) => CFileResource.from(params.url, content, params.encoding, baseFilename)),
        );
    },
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
        // console.error('handleRequestFsReadFileSyncData %o', { url, encoding, data });
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
    ({ params }) => createResponse(writeFile(params, params.content)),
    undefined,
    'Node: fs.writeFile',
);

async function writeFile(fileRef: FileReference, content: string | ArrayBufferView): Promise<FileReference> {
    const gz = isGZipped(content);
    const { url, encoding, baseFilename } = fileRef;
    const resultRef: FileReference = { url, encoding, baseFilename, gz };
    await fs.writeFile(fileURLToPath(fileRef.url), encodeContent(fileRef, content));
    return resultRef;
}

/**
 * Handle fs:writeFile
 */
const handleRequestFsWriteFileDataUrl = RequestFsWriteFile.createRequestHandler(
    (req, next) => {
        const fileResource = req.params;
        const { url } = req.params;
        if (url.protocol !== 'data:') return next(req);
        const gz = isGZipped(fileResource.content);
        const baseFilename = fileResource.baseFilename || 'file.txt' + (gz ? '.gz' : '');
        const mt = guessMimeType(baseFilename);
        const mediaType = mt?.mimeType || 'text/plain';
        const dataUrl = toDataUrl(fileResource.content, mediaType, [['filename', baseFilename]]);
        return createResponse(Promise.resolve({ url: dataUrl, baseFilename, gz, encoding: mt?.encoding }));
    },
    undefined,
    'Node: fs.writeFile DataUrl',
);

/**
 * Handle fs:writeFile compressed
 */
const handleRequestFsWriteFileGz = RequestFsWriteFile.createRequestHandler(
    (req, next, dispatcher) => {
        const fileResource = req.params;
        if (
            !fileResource.gz &&
            !isGzFile(fileResource.url) &&
            (!fileResource.baseFilename || !isGzFile(fileResource.baseFilename))
        ) {
            return next(req);
        }
        if (typeof fileResource.content !== 'string' && isGZipped(fileResource.content)) {
            // Already compressed.
            return next(req);
        }

        return createResponse(compressAndChainWriteRequest(dispatcher, fileResource, fileResource.content));
    },
    undefined,
    'Node: fs.writeFile compressed',
);

async function compressAndChainWriteRequest(
    dispatcher: Dispatcher,
    fileRef: FileReference,
    content: string | ArrayBufferView,
): Promise<FileReference> {
    const buf = await pGzip(encodeContent(fileRef, content));
    const res = dispatcher.dispatch(RequestFsWriteFile.create({ ...fileRef, content: buf }));
    assert(isServiceResponseSuccess(res));
    return res.value;
}

export function registerHandlers(serviceBus: ServiceBus) {
    /**
     * Handlers are in order of low to high level
     * Order is VERY important.
     */
    const handlers = [
        handleRequestFsReadFile,
        handleRequestFsReadFileSync,
        handleRequestFsWriteFile,
        handleRequestFsWriteFileDataUrl,
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

function encodeContent(ref: FileReference, content: string | ArrayBufferView): string | Buffer {
    if (typeof content === 'string') {
        if (!ref.encoding || ref.encoding === 'utf-8') return content;
        return arrayBufferViewToBuffer(encodeString(content, ref.encoding));
    }
    return arrayBufferViewToBuffer(content);
}
