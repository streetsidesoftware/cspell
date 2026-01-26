// import * as Plot from '@observablehq/plot';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
} from 'chart.js';
import { Canvas } from 'skia-canvas';

import type { CsvRecordsRO } from '../CsvRecord.ts';
import { createDailyStats } from '../dailyStats.ts';
import type { Options } from '../options.ts';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

Chart.register([CategoryScale, BarController, BarElement, LineController, LineElement, LinearScale, PointElement]);

export async function plotPng(records: CsvRecordsRO, _options: Options): Promise<Buffer> {
    const dailyStats = createDailyStats(records);

    const xAxis = dailyStats.map((d) => `${monthNames[d.date.getUTCMonth()]}-${d.date.getUTCDate()}`);

    const canvas = new Canvas(900, 600);
    const chart = new Chart(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas as any, // TypeScript needs "as any" here
        {
            data: {
                labels: xAxis,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Kilobytes per Second',
                        data: dailyStats.map((d) => d.kps),
                    },
                    {
                        type: 'line',
                        label: 'Avg Kilobytes per Second',
                        data: dailyStats.map((d) => d.fpsByRepo.get('googleapis/google-cloud-cpp')?.avg || 1),
                    },
                ],
            },
        },
    );
    const pngBuffer = await canvas.toBuffer('png', { matte: 'white' });
    chart.destroy();
    return pngBuffer;
}
