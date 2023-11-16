export function toURL(url: string | URL): URL {
    return typeof url === 'string' ? new URL(url) : url;
}
