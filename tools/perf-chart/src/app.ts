import { program } from 'commander';

import { perfReportMd } from './perfChart.js';

program
    .argument('<file>', 'path to perf data file')
    .description('Generate a min/max chart of the perf data')
    .action(async (file) => {
        const chart = await perfReportMd(file);
        console.log(chart);
    })
    .parseAsync();
