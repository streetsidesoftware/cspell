import { measurePerf, PerfConfig } from './perfFastTrieBlob.js';

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

    // eslint-disable-next-line no-process-exit
    process.exit(1);
}

measurePerf(args[0], args[1]);
