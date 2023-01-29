# `@cspell/strong-weak-map`

A Map with weakly referenced values.

JavaScript [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) provides weak keys and strong values.

`StrongWeakMap` allows for strong keys and weak values while providing the same API as [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

## Install

```sh
npm install -S @cspell/strong-weak-map
```

# Usage

TypeScript Example: Simple text file reader.

```ts
import { StrongWeakMap } from '@cspell/strong-weak-map';
import { promises as fs } from 'fs';

const cache = new StrongWeakMap<string, Promise<string>>();

export function readTextFile(filename: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  const cached = cache.get(filename);
  if (cached) return cached;

  const content = fs.readFile(filename, encoding);

  cache.set(filename, content);

  return content;
}
```

The above example will reuse the promise as long as it has not been cleaned up by the Garbage Collector.

# API

See: [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">
Brought to you by <a href="https://streetsidesoftware.com" title="Street Side Software">
<img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software
</a>
</p>

<!--- @@inject-end: ../../static/footer.md --->
