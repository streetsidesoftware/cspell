declare module "get-uri" {
    import * as fs from 'fs';

    function getUri(uri: string, callback?: (err: any, fs: fs.ReadStream) => any): void;
    function getUri(uri: string, options?: { cache?: fs.ReadStream }, callback?: (err: any, fs: fs.ReadStream) => any): void;
    export = getUri;
}
