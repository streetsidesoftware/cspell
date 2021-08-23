---
title: 'Searching Dictionaries'
categories: docs
# parent: Docs
nav_order: 4
---

# Searching Dictionaries

The `trace` command is used to search for words in the CSpell dictionaries.

## Command: `trace` - See which dictionaries contain a word

Trace shows a the list of known dictionaries and a `*` next to the ones that contain the word.

A `!` will appear next to the ones where the word is forbidden.

![image](https://user-images.githubusercontent.com/3740137/130417575-71da1608-db90-4db3-9679-25ed32227df5.png)

The word is found in a dictionary if a `*` appears before the dictionary name. ![image](https://user-images.githubusercontent.com/3740137/130417834-5f8ae058-6723-4801-b950-d8864809206d.png)

The dictionary is _enabled_, (in use based upon the file type), if the dictionary name is followed by a `*`. ![image](https://user-images.githubusercontent.com/3740137/130418257-583ba581-2ff9-459a-a888-6016a93666ab.png)

## Options

```
Usage: cspell trace [options] <words...>

Trace words
  Search for words in the configuration and dictionaries.

Options:
  -c, --config <cspell.json>  Configuration file to use.  By default cspell
                              looks for cspell.json in the current directory.
  --locale <locale>           Set language locales. i.e. "en,fr" for English
                              and French, or "en-GB" for British English.
  --languageId <language>     Force programming language for unknown
                              extensions. i.e. "php" or "scala"
  --no-color                  Turn off color.
  --color                     Force color
  -h, --help                  display help for command
```

### Using `languageId`

**Search for `errorcode`**

```sh
cspell trace --languageId=cpp "errorcode"
```

![image](https://user-images.githubusercontent.com/3740137/130419629-0d8b6781-f775-4b9f-beac-4d9b98505893.png)

The `+` between _error`+`code_ indicates that it was found using compound words enabled by `allowCompoundWords` setting.

<!---
cspell:ignore errorcode
--->
