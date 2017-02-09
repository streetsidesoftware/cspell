# hunspell-reader
[![Build Status](https://travis-ci.org/Jason3S/cSpell-Tools.svg?branch=master)](https://travis-ci.org/Jason3S/cSpell-Tools)

A library for reading Hunspell Dictionary files

## Application
This reader can be used as a tool for converting Hunspell files into a simple text file
with one word per line.

### Installation

```
npm install -g hunspell-reader
```

### Usage

It has basic command line help.

```
hunspell-reader words --help
```

Outputs:
```

  Usage: words [options] <hunspell_dic_file>

  Output all the words in the <hunspell.dic> file.

  Options:

    -h, --help           output usage information
    -o, --output <file>  output file - defaults to stdout
    -s, --sort           sort the list of words
    -u, --unique         make sure the words are unique.
    -i, --ignore_case    used with --unique and --sort
    -l, --lower_case     output in lower case
    -T, --no-transform   Do not apply the prefix and suffix transforms.  Root words only.

```

### Converting Hunspell to word list

To convert a Hunspell dictionary to a word list, you will need both the `.dic` and `.aff` files.
For example en_US comes with two files: `en_US.dic` and `en_US.aff`.
This tool assumes they are both in the same directory.

Assuming these files are in the current directory, the following command will write the words
to `en_US.txt`.

```
hunspell-reader words ./en_US.dic -o en_US.txt
```

## Library Functions

### Installation

```
install -S hunspell-reader rxjs
```

Note: the reader uses rxjs 5.0.

### Usage

Typescript / Javascript:

```typescript
import { HunspellReader } from 'hunspell-reader';

const baseFile = 'en_US';
const dicFile = baseFile + '.dic';
const affFile = baseFile + '.aff';

// Initialize the reader with the Hunspell files
const reader = new HunspellReader(affFile, dicFile);

// Get the words as an array
const promiseArrayOfWords = reader.readWords()
    .toArray()
    .toPromise();

```

