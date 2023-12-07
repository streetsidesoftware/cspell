export interface TextFileRef {
    url: URL;
}

export interface TextFile {
    url: URL;
    content: string;
}

export function createTextFile(url: URL, content: string): TextFile {
    return { url, content };
}
