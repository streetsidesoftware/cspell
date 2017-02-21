# cSpell-Tools

[![Build Status](https://travis-ci.org/Jason3S/cSpell-Tools.svg?branch=master)](https://travis-ci.org/Jason3S/cSpell-Tools)

Tools used to assist cSpell Development.

The Primary use of this tool is to build dictionaries used by cspell.  This tool will convert a word list or a hunspell file into a file usable by cspell.

## Install

```sh
npm install -g cspell-tools
```

## Usage

```sh
cspell-tools --help
```

To create a word list.

```sh
cspell-tools compile keywords.txt -o ./dictionaries/
```

This will filter the words from `keywords.txt` and write them to `./dictionaries/keywords.txt.gz`.

To create a trie file from a hunspell file.

```sh
cspell-tools compile-trie english.dic
```

This will read and expand the `english.dic` file based upon the rules in `english.aff` into a new file called `english.trie.gz`

For large files, this process can take a long time and us a lot of memory.

The tool `cspell-trie` can be used to read the contents of a `.trie` or `.trie.gz` file.

