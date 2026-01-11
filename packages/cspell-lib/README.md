# CSpell Library

`cspell-lib` is the workhorse behind cspell. It does all the heavy lifting necessary to spell check files.

## Support Future Development

<!--- @@inject: ../../static/sponsor.md --->

[![GitHub Sponsors](https://img.shields.io/badge/-Street_Side_Software-black?style=for-the-badge&logo=githubsponsors&label=GitHub%20Sponsor%3A)](https://github.com/sponsors/streetsidesoftware)

[![Open Collective](https://img.shields.io/badge/-CSpell-black?style=for-the-badge&logo=opencollective&label=Open%20Collective%3A)](https://opencollective.com/cspell)

[![Street Side Software](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fstreetsidesoftware%2Fcspell%2Frefs%2Fheads%2Fmain%2Fstatic%2Fcspell-badge.json)](https://streetsidesoftware.com/sponsor/)

[![PayPal](https://img.shields.io/badge/-Street_Side_Software-black?style=for-the-badge&logo=paypal&label=PayPal%20Donate%3A)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)

<!--- @@inject-end: ../../static/sponsor.md --->

## Installation

```
npm i -S cspell-lib
```

## Usage

### Example - Check some text

Here is an example of using `spellCheckDocument` to spell check some text with a spelling issue.

```ts
import assert from 'node:assert';

import { spellCheckDocument } from 'cspell-lib';

// cspell:ignore wordz coztom clockz cuztom
const customWords = ['wordz', 'cuztom', 'clockz'];

async function checkSpelling(phrase: string) {
  const result = await spellCheckDocument(
    { uri: 'text.txt', text: phrase, languageId: 'plaintext', locale: 'en' },
    { generateSuggestions: true, noConfigSearch: true },
    { words: customWords, suggestionsTimeout: 2000 }
  );
  return result.issues;
}

export async function run() {
  console.log(`Start: ${new Date().toISOString()}`);
  const r = await checkSpelling('These are my coztom wordz.');
  console.log(`End: ${new Date().toISOString()}`);
  // console.log(r);
  assert(r.length === 1, 'Make sure we got 1 spelling issue back.');
  assert(r[0].text === 'coztom');
  assert(r[0].suggestions?.includes('cuztom'));
  // console.log('%o', r);
}
```

### Example - Check a file

```ts
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spellCheckDocument } from 'cspell-lib';

export async function checkFile(filename: string) {
  const uri = pathToFileURL(resolve(filename)).toString();
  const result = await spellCheckDocument(
    { uri },
    { generateSuggestions: true, noConfigSearch: true },
    { words: customWords, suggestionsTimeout: 2000 }
  );
  return result.issues;
}
```

## CSpell for Enterprise

<!--- @@inject: ../../static/tidelift.md --->

Available as part of the Tidelift Subscription.

The maintainers of cspell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

<!--- @@inject-end: ../../static/tidelift.md --->

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">Brought to you by<a href="https://streetsidesoftware.com" title="Street Side Software"><img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software</a></p>

<!--- @@inject-end: ../../static/footer.md --->
