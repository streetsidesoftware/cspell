export type TArrayBufferView<T extends ArrayBuffer = ArrayBuffer> = ArrayBufferView<T>;

export async function decompress(
    data: TArrayBufferView,
    method: CompressionFormat = 'gzip',
): Promise<Uint8Array<ArrayBuffer>> {
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const ds = new DecompressionStream(method);

    const writer = ds.writable.getWriter();
    const reader = ds.readable.getReader();

    try {
        const pWrite = writer.write(data).then(() => writer.close());

        const chunks: Uint8Array[] = [];
        let size = 0;

        while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            chunks.push(chunk.value);
            size += chunk.value.length;
        }

        const result = new Uint8Array(size);
        for (let offset = 0, i = 0; i < chunks.length; i++) {
            result.set(chunks[i], offset);
            offset += chunks[i].length;
        }
        await pWrite;
        return result;
    } finally {
        reader.releaseLock();
        writer.releaseLock();
    }
}
