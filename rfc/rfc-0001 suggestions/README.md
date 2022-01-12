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

<!--- cspell:ignore acadmic accension -->

```

```
