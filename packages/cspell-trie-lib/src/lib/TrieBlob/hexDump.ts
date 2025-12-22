/* eslint-disable unicorn/prefer-code-point */
export function hexDump(buffer: Uint8Array): string {
    function hexLine(offset: number, chunk: Uint8Array): string {
        const hex = [...chunk].map((b, i) => b.toString(16).padStart(2, '0') + ((i & 3) === 3 ? ' ' : '')).join(' ');
        const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
        return offset.toString(16).padStart(8, '0') + '  ' + hex.padEnd(52, ' ') + ' ' + ascii;
    }

    const lines: string[] = [];
    const chunkSize = 16;
    for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.subarray(i, i + chunkSize);
        lines.push(hexLine(i, chunk));
    }
    return lines.join('\n');
}
