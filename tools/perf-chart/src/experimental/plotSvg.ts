// import * as Plot from '@observablehq/plot';
import * as Plot from '@observablehq/plot';
import { JSDOM } from 'jsdom';

import type { CsvRecordsRO } from '../CsvRecord.ts';
import { createDailyStats } from '../dailyStats.ts';
import type { Options } from '../options.ts';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function plotSvg(records: CsvRecordsRO, _options: Options): string {
    const dailyStats = createDailyStats(records);

    const data = dailyStats.map((row) => ({
        date: `${monthNames[row.date.getUTCMonth()]}-${row.date.getUTCDate()}`,
        kps: row.kps,
    }));

    const plot = Plot.plot({
        document: new JSDOM('').window.document,
        marks: [Plot.dot(data, { x: 'date', y: 'kps' })],
    });

    plot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg');
    plot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');

    return plot.outerHTML;
}

// cspell:dictionaries html
