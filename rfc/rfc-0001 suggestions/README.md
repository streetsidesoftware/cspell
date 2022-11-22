# Suggestion Lists and Typos

Suggestion lists are useful in addressing common mistakes as noted by [Wikipedia:Lists of common misspellings - Wikipedia](https://en.wikipedia.org/wiki/Wikipedia:Lists_of_common_misspellings)

The idea is to make it easier for companies / projects to define a list of forbidden terms with a list of suggested replacements.

Below is a proposal on two ways to define suggestions.
The intention is to implement both. Since `flagWords` is easier to do, it might get done first.

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
  - alturnative: > # cspell:disable-line
      alternative
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

<!--- cspell:enable -->

Validation:

```regexp
/^((?:\p{L}\p{M}*)+)\s*->\s*((?:\p{L}\p{M}*)+)(?:,\s*((?:\p{L}\p{M}*)+))*$/gmu
```

![image](https://user-images.githubusercontent.com/3740137/149126237-455c6674-ed1f-4dd8-8136-083531d2c63b.png)

### Dictionary Definition

```yaml
dictionaryDefinitions:
  - name: en-us-typo-suggestions
    path: ./en-us-typos.txt
    type: suggestions # alternatively we could call it a `typo` file.
```

### Inline Dictionary Definitions

```yaml
dictionaryDefinitions:
  - name: company-terms
    words:
      - MyCompanyName
```

<!--- cspell:ignore acadmic accension -->

# Terminology

Having 3 different list for words can be a bit painful.

- `words` and `userWords`
- `ignoreWords`
- `flagWords`

To make it more painful, VS Code doesn't provide a way to merge "lists" in its settings. To help with the issue, `userWords` was created, but
that was an incomplete solution.

This is a proposed data structure that merges all three concepts and is compatible with how VS Code merges configuration.

Example Term definition:

**`cspell.config.yaml`**

```yaml
terms:
  crap: false # forbid this word
  incase:
    - in case # forbid this word and suggest `in case`
  ignoreX: null # ignore this word
  abandoning: true # this word is an acceptable term
  abondoning: # cspell:disable-line
    - abandoning
  accesories: ['accessories'] # cspell:disable-line
  accidant: ['accident'] # cspell:disable-line
  accident: y # Accident is an allowed word
  # cspell:disable-next-line
  alusion: allusion, illusion # two suggestions `alusion`
```
