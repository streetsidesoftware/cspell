import type { CSpellConfigFile } from './CSpellConfigFile.js';
import { defaultNextDeserializer, defaultNextSerializer } from './defaultNext.js';
import type { FileLoaderMiddleware, LoaderNext, LoadRequest } from './FileLoader.js';
import type { DeserializerNext, SerializerMiddleware, SerializerNext } from './Serializer.js';

export function getDeserializer(middleware: SerializerMiddleware[]): DeserializerNext {
    let next: DeserializerNext = defaultNextDeserializer;
    for (const des of middleware) {
        next = curryDeserialize(des, next);
    }
    return next;
}
export function getSerializer(middleware: SerializerMiddleware[]): SerializerNext {
    let next: SerializerNext = defaultNextSerializer;
    for (const des of middleware) {
        next = currySerialize(des, next);
    }
    return next;
}
function curryDeserialize(middle: SerializerMiddleware, next: DeserializerNext): DeserializerNext {
    return (content) => middle.deserialize(content, next);
}
function currySerialize(middle: SerializerMiddleware, next: SerializerNext): SerializerNext {
    return (cfg) => middle.serialize(cfg, next);
}

function curryLoader(loader: FileLoaderMiddleware, next: LoaderNext): LoaderNext {
    return (req) => loader.load(req, next);
}

async function defaultLoader(req: LoadRequest): Promise<CSpellConfigFile> {
    const { io, deserialize } = req.context;
    const url = req.url;
    const file = await io.readFile(url);
    return deserialize(file);
}

export function getLoader(loaders: FileLoaderMiddleware[]): LoaderNext {
    let next: LoaderNext = defaultLoader;

    for (const loader of loaders) {
        next = curryLoader(loader, next);
    }

    return next;
}
