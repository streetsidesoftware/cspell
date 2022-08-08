export interface IO {
    readFile(uri: string): Promise<string>;
    writeFile(uri: string, content: string): Promise<void>;
}
