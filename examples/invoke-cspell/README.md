# Invoke CSpell

Example of invoking CSpell Lint programmatically.

<!--- @@inject: ./index.mjs --->

```javascript
import { lint } from 'cspell';

await lint(['.'], {
    progress: true,
    summary: true,
    // progress: false,
    // summary: false,
    // wordsOnly: true,
    // config: './cspell.config.yaml',
});
```

<!--- @@inject-end: ./index.mjs --->
