export interface TableOptions {
    header: string[] | string;
    headerSep?: string[];
    rows: (string | number | boolean)[][];
}

/**
 *
 * @param options - table options
 * @returns
 */
export function createMdTable(options: TableOptions): string {
    const rows = options.rows.map((row) => row.map((col) => `${col}`.trim()));

    let header: string[];
    let headerSep: string[];
    if (typeof options.header === 'string') {
        const hLines = options.header
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => !!line)
            .map((line) =>
                line
                    .replace(/^\s*\|/, '')
                    .replace(/\|\s*$/, '')
                    .split('|')
                    .map((col) => col.trim()),
            );
        header = hLines[0];
        headerSep = options.headerSep || hLines[1];
    } else {
        header = options.header.map((col) => `${col}`.trim());
        headerSep = options.headerSep || [];
    }

    const justifyLeft = (s: string, width: number) => padRight(s.trim(), width);
    const justifyRight = (s: string, width: number) => padLeft(s.trim(), width);

    function calcColHeaderSep(sep: string, width: number): string {
        const pL = sep.startsWith(':') ? ':' : '';
        const pR = sep.endsWith(':') ? ':' : '';
        width -= pL.length + pR.length;
        return `${pL}${'---'.padEnd(width, '-')}${pR}`;
    }

    const justifyCols: ((s: string, width: number) => string)[] = [];
    const hSep = [...headerSep];
    hSep.length = header.length;
    header.forEach((col, i) => {
        const s = hSep[i] || '---';
        const h = calcColHeaderSep(s, strWidth(col));
        const jL = h.startsWith(':');
        const jR = h.endsWith(':');
        justifyCols[i] = jL ? justifyLeft : jR ? justifyRight : justifyLeft;
        hSep[i] = h;
    });

    const table: string[][] = [[...header], hSep, ...rows.map((row) => [...row])];

    const widths: number[] = [];

    table.forEach((row) => row.forEach((col, i) => (widths[i] = Math.max(widths[i] || 0, strWidth(col)))));

    table[1] = table[1].map((col, i) => calcColHeaderSep(col, widths[i]));

    return table
        .map((row) => row.map((col, i) => justifyCols[i](col, widths[i])).join(' | '))
        .map((row) => `| ${row} |`)
        .join('\n');
}

function padLeft(s: string, width: number): string {
    return s.padStart(width + (s.length - strWidth(s)));
}

function padRight(s: string, width: number): string {
    return s.padEnd(width + (s.length - strWidth(s)));
}

function strWidth(str: string): number {
    return [...str].length;
}
