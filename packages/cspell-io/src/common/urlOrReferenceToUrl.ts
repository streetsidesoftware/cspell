import type { FileReference } from '../models/index.js';

type UrlOrReference = URL | FileReference;

export function urlOrReferenceToUrl(urlOrReference: UrlOrReference): URL {
    return urlOrReference instanceof URL ? urlOrReference : urlOrReference.url;
}
