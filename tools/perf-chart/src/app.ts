import { program } from 'commander';

import { perfReport } from './perfChart.ts';

program
    .argument('<file>', 'path to perf data file')
    .description('Generate a min/max chart of the perf data')
    .option('-o, --output <path>', 'Path to the output the Markdown file.')
    .option('-g, --svg <path>', 'Path to SVG file to generate.')
    .option('-p, --png <path>', 'Path to PNG file to generate.')
    .option('-u, --site-url <url>', 'The url to prefix svg/png path when adding it to the markdown.')
    .option(
        '-d, --days <number>',
        'The number of days in the past to plot.',
        (value: string) => Number.parseInt(value, 10),
        30,
    )
    .action(async (file, options) => {
        await perfReport(file, options);
    })
    .parseAsync();
