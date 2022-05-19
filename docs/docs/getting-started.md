---
nav_order: 4
---

# Getting Started

## Running

If you have CSpell installed globally, you can run it like this:

```sh
cspell --version
```

If you have CSpell installed locally in a JavaScript/TypeScript project:

```sh
# If you use NPM
npx cspell --version

# If you use Yarn
yarn cspell --version
```

## Basic Usage

### Check Every File

```sh
cspell "**"
```

This will recursively check every file in the current directory.

Note that by default, CSpell will use the "lint" command, which means that `cspell "**"` is the same thing as `cspell lint "**"`.

### Check Some Files

```sh
cspell "src/**/*.js"
```

This will only check files in the "src" directory with a ".js" extension (i.e. JavaScript files).

### Check a Specific File In-Depth

```sh
cspell check "README.md"
```

This will output the text in the "README.md" file and show the misspelled words in red.

### Search Through Currently Installed Dictionaries for a Word

```sh
cspell trace "poop"
```

This will output what the currently installed dictionaries are, which dictionaries are currently enabled (in yellow), and which dictionaries contain the specified word (with an asterisk in the "F" column).

### Get a Suggestion for a Word

<!-- cspell:ignore absense -->

```sh
cspell suggestions "absense"
```

This will attempt to guess what the right spelling is for the specified word.

## Adding CSpell to an Existing Project

If you run CSpell on all the files of an existing project, it will probably find a bunch of false positives. So, the first step is to get rid of all the false positives. We can do that by adding some words to a custom dictionary for the project.

In the steps below, we will create a CSpell configuration file and set up a single custom dictionary.

1. [Creating a Configuration File](#create-a-configuration-file)
1. [Add words to the project dictionary](#add-words-to-the-project-dictionary)
1. [Fine-tuning](#fine-tuning)

### Creating a Configuration File

Create the following file at the root of your repository:

#### **`.cspell.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  "version": "0.2",
  "dictionaryDefinitions": [
    {
      "name": "project-words",
      "path": "./project-words.txt",
      "addWords": true
    }
  ],
  "dictionaries": ["project-words"],
  "ignorePaths": ["node_modules", "/project-words.txt"]
}
```

Alternatively, if you don't want to use JSON for whatever reason, you can also use YAML:

#### **`cspell.config.yaml`**

```yaml
---
$schema: https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json
version: '0.2'
dictionaryDefinitions:
  - name: project-words
    path: './project-words.txt'
    addWords: true
dictionaries:
  - project-words
ignorePaths:
  - 'node_modules'
  - '/project-words.txt'
```

These configuration files do three things:

1. Define the custom dictionary of `project-words`.
1. Tell the spell checker to use the custom dictionary.
1. Tell the spell checker to ignore any files inside of `node_modules` and the file `project-words.txt`.

Finally, create the dictionary file as well.

```sh
touch project-words.txt
```

The dictionary is simply a text file that contains each word on a separate line.

## Add words to the project dictionary

Now, we have to start filtering out the false positives. It might take a few iterations to get everything filtered out.

1. Choose a set of files to start with, like all Markdown files. Then, run CSpell.

   ```sh
   cspell "**/*.md"
   ```

   This will give you a baseline idea about what to do in the next steps.

1. Based on the results on the spell check, you might see that there are some false positives from files that you don't care about (like transpiled files in a "dist" directory). If this is the case, then add those paths to the `ignorePaths` section of the configuration file. For example:

   - `"bin"` - Ignores any directory or file called `bin`.
   - `"translations/**"` - Ignores all files under the `translations` directory.
   - `"packages/*/dist"` - Ignores the `dist` subdirectory in each `package` directory.

1. From here, run CSpell again, and depending on how many false positives there are, you can proceed in two different ways. First, if there are only a handful of false positives remaining, then you can just manually add them to the dictionary file, and then you are done!

1. If there are a lot of false positives, then you can programmatically add every misspelled word to the custom dictionary:

   ```sh
   cspell --words-only --unique "**/*.md" | sort --ignore-case >> project-words.txt
   ```

1. Go through all of the words that were added to `project-words.txt` to ensure that there were no real spelling errors that were copied over. If you found a real misspelled word, then delete it from the dictionary, and fix the spelling error in the source code.

1. Repeat the process with the other file types you want to check.

## Fine-Tuning

The following resources can help you with fine-tuning your configurations:

- [Making words forbidden](./forbidden-words.md)
- [Defining Custom Dictionaries](./custom-dictionaries.md)
- [About Dictionaries](./dictionaries.md)
- [Understanding CSpell Globs](./globs.md)
