import { program } from 'commander';

import { perfReport } from './perfChart.js';

program
    .argument('<file>', 'path to perf data file')
    .description('Generate a min/max chart of the perf data')
    .action(async (file) => {
        const chart = await perfReport(file);
        console.log(chart);
    })
    .parseAsync();
