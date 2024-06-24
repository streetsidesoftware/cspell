import chalk from 'chalk';

import { ansiWidth, pad } from './pad.js';

export type RowTextFn = (maxWidth: number | undefined) => string;

export type TableCell = string | RowTextFn;
export type TableRow = TableCell[];

export interface Table {
    header: string[];
    rows: TableRow[];
    terminalWidth?: number;
    deliminator?: string;
}

export function tableToLines(table: Table, deliminator?: string): string[] {
    const del = deliminator || table.deliminator || ' | ';
    const columnWidths: number[] = [];

    const { header, rows } = table;

    function getText(col: string | RowTextFn, maxWidth?: number): string {
        return typeof col === 'string' ? col : col(maxWidth);
    }

    function getRCText(row: number, col: number, maxWidth?: number): string {
        return getText(rows[row][col], maxWidth);
    }

    function recordHeaderWidths(header: string[]) {
        header.forEach((col, idx) => {
            columnWidths[idx] = Math.max(ansiWidth(col), columnWidths[idx] || 0);
        });
    }

    function recordColWidths(row: (string | RowTextFn)[], rowIndex: number) {
        row.forEach((_col, idx) => {
            columnWidths[idx] = Math.max(ansiWidth(getRCText(rowIndex, idx, undefined)), columnWidths[idx] || 0);
        });
    }

    function justifyRow(c: string, i: number) {
        return pad(c, columnWidths[i]);
    }

    function toLine(row: TableCell[]) {
        return decorateRowWith(
            row.map((c, i) => getText(c, columnWidths[i])),
            justifyRow,
        ).join(del);
    }

    function* process() {
        yield toLine(decorateRowWith(header, headerDecorator));
        yield* rows.map(toLine);
    }

    function adjustColWidths() {
        if (!table.terminalWidth) return;

        const dWidth = (columnWidths.length - 1) * ansiWidth(del);

        let remainder = table.terminalWidth - dWidth;

        for (let i = 0; i < columnWidths.length; i++) {
            const colWidth = Math.min(columnWidths[i], remainder);
            columnWidths[i] = colWidth;
            remainder -= colWidth;
        }
    }

    recordHeaderWidths(header);
    rows.forEach(recordColWidths);

    adjustColWidths();

    return [...process()];
}

type TextDecorator = (t: string, index: number) => string;

function headerDecorator(t: string): string {
    return chalk.bold(chalk.underline(t));
}

export function decorateRowWith(row: string[], ...decorators: TextDecorator[]): string[] {
    return decorators.reduce((row, decorator) => row.map(decorator), row);
}
