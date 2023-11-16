export interface IO {
    readFile(url: URL): Promise<string>;
    writeFile(url: URL, content: string): Promise<void>;
}
