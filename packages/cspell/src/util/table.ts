import chalk from 'chalk';
import strip from 'strip-ansi';

export interface Table {
    header: string[];
    rows: string[][];
    deliminator?: string;
}

export function tableToLines(table: Table, deliminator?: string): string[] {
    deliminator = deliminator || table.deliminator || ' | ';
    const columnWidths: number[] = [];

    const { header, rows } = table;

    function recordWidths(row: string[]) {
        row.forEach((col, idx) => {
            columnWidths[idx] = Math.max(strip(col).length, columnWidths[idx] || 0);
        });
    }

    function justifyRow(c: string, i: number) {
        return c + ' '.repeat(columnWidths[i] - strip(c).length);
    }

    function toLine(row: string[]) {
        return decorateRowWith(row, justifyRow).join(deliminator);
    }

    function* process() {
        yield toLine(decorateRowWith(header, headerDecorator));
        yield* rows.map(toLine);
    }

    recordWidths(header);
    rows.forEach(recordWidths);

    return [...process()];
}

type TextDecorator = (t: string, index: number) => string;

function headerDecorator(t: string): string {
    return chalk.bold(chalk.underline(t));
}

export function decorateRowWith(row: string[], ...decorators: TextDecorator[]): string[] {
    return decorators.reduce((row, decorator) => row.map(decorator), row);
}
