# CSpell Library

`cspell-lib` is the workhorse behind cspell. It does all the heavy lifting necessary to spell check files.

## Support Future Development

<!--- @@inject: ../../static/sponsor.md --->

If CSpell saves you time, please consider supporting its development.

<p align="left">
  <a href="https://github.com/sponsors/streetsidesoftware" title="GitHub Sponsor"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/github-sponsor-dark.png"><img alt="GitHub Sponsor" src="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/github-sponsor.png" width="180" /></picture></a>
  &nbsp;
  <a href="https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY" title="PayPal"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/paypal-dark.png"><img alt="PayPal" src="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/paypal.png" width="180" /></picture></a>
  &nbsp;
  <a href="https://opencollective.com/cspell" title="Open Collective"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/open-collective-dark.png"><img alt="Open Collective" src="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/open-collective.png" width="180" /></picture></a>
  &nbsp;
  <a href="https://streetsidesoftware.com/sponsor/" title="Street Side Software"><picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/cspell-dark.png"><img alt="CSpell" src="https://raw.githubusercontent.com/streetsidesoftware/cspell/main/static/sponsor/cspell.png" width="180" /></picture></a>
</p>

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
