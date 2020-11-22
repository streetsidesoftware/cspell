import strip from 'strip-ansi';

export function tableToLines(data: string[][], deliminator = ' | '): string[] {
    const columnWidths: number[] = [];

    data.forEach((line) =>
        line.forEach((col, idx) => {
            columnWidths[idx] = Math.max(strip(col).length, columnWidths[idx] || 0);
        })
    );

    const r = data.map((line) =>
        line.map((col, i) => col + ' '.repeat(columnWidths[i] - strip(col).length)).join(deliminator)
    );
    return r;
}
