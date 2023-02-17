# js2mjs

Rename ESM .js files to .mjs

- `file.js` => `file.mjs`
- `file.d.ts` => `file.d.mts`

```diff
import * as path from 'path';
import { lib } from 'package/lib/index.js'
-import { findFiles } from './findFiles.js';
+import { findFiles } from './findFiles.mjs';
```

```diff

```
