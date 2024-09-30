import { lint } from 'cspell';

await lint(['.'], {
    progress: true,
    summary: true,
    // progress: false,
    // summary: false,
    // wordsOnly: true,
    // config: './cspell.config.yaml',
});
