---
parent: Commands
---

# `trace`

Search for specific words in all of the CSpell dictionaries that you currently have downloaded/available.

- The dictionaries in yellow are currently enabled (based on your current config).
- The dictionaries in orange are currently disabled (based on your current config).
- A `*` will appear in the `F` column to indicate that the respective dictionary contains the word. (`F` is short for "found".)
- A `!` will appear in the `F` column to indicate that the respective dictionary forbids the word.

Here's an example showing `cspell trace colour`: <!-- cspell:ignore colour -->

![image](https://user-images.githubusercontent.com/3740137/130417575-71da1608-db90-4db3-9679-25ed32227df5.png)

The word is found in a dictionary if a `*` appears before the dictionary name. ![image](https://user-images.githubusercontent.com/3740137/130417834-5f8ae058-6723-4801-b950-d8864809206d.png)

The dictionary is _enabled_, (in use based upon the file type), if the dictionary name is followed by a `*`. ![image](https://user-images.githubusercontent.com/3740137/130418257-583ba581-2ff9-459a-a888-6016a93666ab.png)

## Options

<!-- Do not copy paste options here, as it can and will become out of date. Instead, use a script in CI to automatically generate Markdown content from the source code directly. -->

You can see the available options for this command in [the source code](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell/src/commandTrace.ts).

### Using `languageId`

For example, to "turn on" the dictionaries for C++ while tracing for the word "errorcode", you could do the following command: <!-- cspell:ignore errorcode -->

```sh
cspell trace --languageId=cpp errorcode
```

Which might produce output that looks like the following:

![image](https://user-images.githubusercontent.com/3740137/130419629-0d8b6781-f775-4b9f-beac-4d9b98505893.png)

In this example, the `+` between "error" and "code" indicates that it was found using compound words. (Compound words are enabled by the `allowCompoundWords` setting.)
