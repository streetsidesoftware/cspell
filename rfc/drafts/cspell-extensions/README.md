# CSpell Extensions (WIP)

## Problem

There are multiple challenges when spell checking documents.

- Parsing - parsing the file into attributed text segments. The attributes could then be used to influence how the spell checking is done.
  How the parsing is achieved is up to the parser. It might make a full syntax tree or something simpler.
- Checking dictionaries for words.

At the current moment, dictionaries are static and do not change once they have been loaded. They are fully independent of the files being checked. But, this is not always sufficient.

One common complaint is that the spell checker finds spelling errors in 3rd party imports.

Many programming languages allow the import of other modules. These modules enter the namespace of the file either explicitly or implicitly. Explicit is easier to handle. TypeScript and JavaScript use explicit imports.

In any case, the dictionaries are unaware of the imports. It is possible to write a configuration using a JavaScript file that can process the imports and make dictionary. But that dictionary will be static.

## The Idea

The idea is to give more power to CSpell Extensions and to configuration writers.

### Dynamic Configuration

```ts

```

## Context

```ts
interface Context {
  cwd: URL;
  io: VirtualIO;
}

interface FileContext extends Context {
  /** The URL of the file. */
  file: URL;
  /** It is possible for a file to match multiple file types. */
  filetype: string | string[];
  /** The content of the file. */
  content: string;
}

interface FileSegmentContext extends Context {
  /** The URL representing the file segment. */
  file: URL;
  /** the file type of the segment. */
  filetype: string | string[];
  /** The content of the file segment. */
  content: string;
  /** The parent context */
  fileContext: FileContext;
}
```

## Virtual IO

The spell checker is used to check more than just local files. It can be used to check files across a Virtual File System. For example, VS Code can be used to check remote files. To access the files, it is necessary to use the VFS provided by VS Code.

The context will have a reference to a Virtual IO that will take care of the transport layer for reading and writing files.

```

```
