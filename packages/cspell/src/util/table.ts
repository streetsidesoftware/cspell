import chalk from 'chalk';

import { ansiWidth, pruneTextEnd } from './ansi.js';
import { pad } from './pad.js';

export type RowTextFn = (maxWidth: number | undefined) => string;

export type TableCell = string | RowTextFn;
export type TableRow = TableCell[] | Record<string, TableCell>;

export type TableHeaderColumnFieldTitle = [field: string, title: string];
export type TableHeader = string[] | TableHeaderColumnFieldTitle[];

export type TextDecorator = (t: string, columnIndex: number) => string;

export interface MaxColumnWidths {
    /**
     * [field name or column index]: number of characters
     */
    [column: string | number]: number | undefined;
}

// export interface ColumnDecorators {
//     [column: string | number]: TextDecorator | undefined;
// }

export interface Table {
    /**
     * The header of the table.
     * Can be an array of strings or an array of tuples with field name and title.
     */
    header: TableHeader;
    /**
     * The rows of the table.
     * Can be an array of arrays or an array of objects with field names as keys.
     */
    rows: TableRow[];
    /**
     * The width of the terminal, used to adjust column widths.
     */
    terminalWidth?: number;
    /**
     * The deliminator used to separate columns in the table.
     * Defaults to ' | ' if not provided.
     */
    deliminator?: string;

    /**
     * The maximum widths for each column.
     * If provided, it will override the calculated widths.
     */
    maxColumnWidths?: MaxColumnWidths;
}

export function tableToLines(table: Table, deliminator?: string): string[] {
    const del = deliminator || table.deliminator || ' | ';
    const columnWidths: number[] = [];
    const maxColumnWidthsMap = table.maxColumnWidths || {};

    const { header, rows } = table;

    const simpleHeader = header.map((col) => (Array.isArray(col) ? col[1] : col));
    const columnFieldNames = header.map((col) => (Array.isArray(col) ? col[0] : col));
    const maxColumnWidths = columnFieldNames.map((field, idx) => maxColumnWidthsMap[field] ?? maxColumnWidthsMap[idx]);

    function getCell(row: number, col: number): TableCell | undefined {
        return getCellFromRow(rows[row], col);
    }

    function getCellFromRow(row: TableRow | undefined, col: number): TableCell | undefined {
        if (!row) return undefined;
        if (Array.isArray(row)) {
            return row[col];
        }
        const fieldName = columnFieldNames[col];
        return (row as Record<string, TableCell>)[fieldName];
    }

    function rowToCells(row: TableRow): (TableCell | undefined)[] {
        if (Array.isArray(row)) {
            return row;
        }
        return columnFieldNames.map((fieldName) => (row as Record<string, TableCell>)[fieldName]);
    }

    function getText(col: string | RowTextFn | undefined, maxWidth?: number): string {
        return !col ? '' : typeof col === 'string' ? pruneTextEnd(col, maxWidth) : col(maxWidth);
    }

    function getRCText(row: number, col: number, maxWidth?: number): string {
        return getText(getCell(row, col), maxWidth);
    }

    function recordHeaderWidths(header: string[]) {
        header.forEach((col, idx) => {
            columnWidths[idx] = Math.max(ansiWidth(col), columnWidths[idx] || 0);
        });
    }

    function recordColWidths() {
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            for (let colIndex = 0; colIndex < columnFieldNames.length; colIndex++) {
                columnWidths[colIndex] = Math.max(
                    ansiWidth(getRCText(rowIndex, colIndex, undefined)),
                    columnWidths[colIndex] || 0,
                );
            }
        }
    }

    function justifyRow(c: string, i: number) {
        return pad(c, columnWidths[i]);
    }

    function toHeaderLine(header: string[]) {
        return decorateRowWith(
            header.map((c, i) => getText(c, columnWidths[i])),
            justifyRow,
            headerDecorator,
        ).join(del);
    }

    function toLine(row: TableRow) {
        return decorateRowWith(
            rowToCells(row).map((c, i) => getText(c, columnWidths[i])),
            justifyRow,
        ).join(del);
    }

    function* process() {
        yield toHeaderLine(simpleHeader);
        yield* rows.map(toLine);
    }

    function sumColumnWidths(): number {
        return columnWidths.reduce((sum, width) => sum + width, 0);
    }

    function adjustColWidths() {
        for (let i = 0; i < columnWidths.length; i++) {
            const mw = maxColumnWidths[i];
            if (!mw) continue;
            columnWidths[i] = Math.min(columnWidths[i], mw);
        }

        if (!table.terminalWidth) return;

        const dWidth = (columnWidths.length - 1) * ansiWidth(del);

        const lineWidth = table.terminalWidth - dWidth;

        if (lineWidth <= columnWidths.length * 2) {
            const fixedWidth = Math.max(Math.min(...columnWidths), 5);
            for (let i = 0; i < columnWidths.length; i++) {
                columnWidths[i] = fixedWidth;
            }
            return;
        }

        if (columnWidths.length === 1) {
            columnWidths[0] = lineWidth;
            return;
        }

        function trimWidestColumn(neededToTrim: number) {
            let first = 0;
            let second = 0;
            for (let i = 0; i < columnWidths.length; i++) {
                if (columnWidths[i] > columnWidths[first]) {
                    second = first;
                    first = i;
                } else if (columnWidths[i] > columnWidths[second]) {
                    second = i;
                }
            }
            const diff = Math.max(columnWidths[first] - columnWidths[second], 1);
            columnWidths[first] -= Math.min(diff, neededToTrim);
        }

        for (let sum = sumColumnWidths(); sum > lineWidth; sum = sumColumnWidths()) {
            trimWidestColumn(sum - lineWidth);
        }
    }

    recordHeaderWidths(simpleHeader);
    recordColWidths();

    adjustColWidths();

    return [...process()];
}

function headerDecorator(t: string): string {
    return chalk.bold(chalk.underline(t));
}

export function decorateRowWith(row: string[], ...decorators: TextDecorator[]): string[] {
    return decorators.reduce((row, decorator) => row.map(decorator), row);
}
