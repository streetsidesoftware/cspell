#!/usr/bin/env node
import { program } from 'commander';

import { perfChart } from './dist/perfChart.js';

program
    .argument('<file>', 'path to perf data file')
    .description('Generate a min/max chart of the perf data')
    .action(async (file) => {
        const chart = await perfChart(file);
        console.log(chart);
    })
    .parseAsync();
