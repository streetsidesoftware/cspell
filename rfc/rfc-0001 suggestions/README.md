# Suggestion Lists

## Flag Words

The idea is to enhance the definition of `flagWords` to allow for suggestions.

### Type Definitions

Replace the definition of `flagWords` with the following:

```ts
type FlagWordNoSuggestions = string;
type FlagWordWithSuggestions = [forbidWord: string, suggestion: string, ...otherSuggestions: string[]];
type FlagWord = FlagWordNoSuggestions | FlagWordWithSuggestions;
type FlagWords = FlagWord[];

interface BaseSettings {
  // ... other fields
  flagWords?: FlagWords;
}
```

### Usage:

```yaml
flagWords:
  - crap
  - [hte, the]
  - [acadmic, academic]
  - [accension, accession, ascension]
```

```json
"flagWords": [
  "crap",
  ["hte", "the"],
  ["acadmic", "academic"],
  ["accension", "accession", "ascension"]
]
```

## Suggestion Dictionary

Be able to leverage lists like:

- [Wikipedia:Lists of common misspellings/For machines - Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Lists_of_common_misspellings/For_machines)

Using a suggestions dictionary provides several useful features:

- The word list is in a separate file
- Multiple formats can be supported
- Named dictionaries can be turned on, off, or even redefined

### File formats

The file format is generally inferred based upon the file extension. All files can be `gzip`d and will have a `.gz` final extension.

#### Text File Format

One suggestion set per line.

Example:

<!--- cspell:disable -->

```txt
againnst->against
agains->against
agaisnt -> against
aganist-> against
aggaravates->aggravates
alusion->allusion, illusion
alwasy->always
alwyas->always
amalgomated->amalgamated
amatuer->amateur
amature->armature, amateur
boaut->boat, bout, about
```

Validation:

```regexp
/^(\p{L}+)\s*->\s*(\p{L}+)(?:,\s*(\p{L}+))*$/gmu
```

![image](https://user-images.githubusercontent.com/3740137/149126237-455c6674-ed1f-4dd8-8136-083531d2c63b.png)

<!--- cspell:enable -->

<!--- cspell:ignore acadmic accension -->
