import { measurePerf } from './perfFastTrieBlob.js';

const args = process.argv.slice(2);

if (args.includes('--help')) {
    console.log(`\
Measure trie perf tool used only for testing.
Usage:

- node run.js [type]
- node run.js <type> [method]

type - all, trie, blob, fast
method - words, has

`);

    // eslint-disable-next-line no-process-exit
    process.exit(1);
}

measurePerf(args[0], args[1]);
