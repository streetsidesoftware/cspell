import { measurePerf, PerfConfig } from './perfSuite.js';

function run() {
    const args = process.argv.slice(2);

    if (args.includes('--help')) {
        console.log(`\
    Measure trie perf tool used only for testing.
    Usage:

    - node run.js [type]
    - node run.js <type> [method]

    type:
    ${Object.entries(PerfConfig)
        .map(([name, opt]) => `- ${name} - ${opt.desc}`)
        .join('\n')}

    method - words, has

    `);

        process.exitCode = 1;
        return;
    }

    measurePerf(args[0], args[1]);
}

run();
