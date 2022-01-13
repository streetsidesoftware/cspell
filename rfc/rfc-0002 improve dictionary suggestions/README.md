# Improving Dictionary Suggestions

The `cspell-trie-lib` packages currently handles making suggestions on dictionaries.

It walks the trie using a modified weighted Levenshtein algorithm. The weights are currently weighted towards English and do not lend themselves well to other languages. See [RFC | Ways to improve dictionary suggestions. · Issue #2249 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/2249)

This proposal is to allow weights to be defined in the `DictionaryDefinition`.

## Defining Weights / Costs

There are 4 types of edit operations:

- insert - inserts a character into the word
- delete - deletes a character from the word
- replace - replaces a character in the word
- swap - swaps two adjacent characters - swap is singled out because it is a common spelling mistake, otherwise it would be considered 2 edits.

In the current implementation: `1 edit = 100 cost`. This was done to allow for partial edits without the need for decimal numbers.

#### Proposed Structure

```ts
interface SuggestionCosts {
  /**
   * A map is a set of characters to be considered together
   * Each individual character is an entry in the set.
   * To have multiple character entry use `()` around the characters.
   * Because multiple sets of characters can have the same intention
   * It is possible to use a single map to define multiple sets by separating
   * each set with a `|`.
   */
  map: string;
  /**
   * The cost to insert a character from the map into a word.
   * @default 100
   */
  insert?: number;
  /**
   * The cost to delete a character from the map from a word.
   * @default 100
   */
  delete?: number;
  /**
   * The cost to replace a character in a set with another from the same set.
   *
   * Example:
   *
   * Give: `map: 'you|tkb', swap: 50`
   * - To swap `a` with `y` is 100
   * - To swap `y` with `u` is 50
   * - to swap `y` with `t` is 100
   * - to swap `t` with `k` is 50
   *
   * @default 100
   */
  swap?: number;
  /**
   * A comment about why a cost is defined.
   */
  description?: string;
}
```

#### Example of costs:

```yaml
costs:
  - description: Accented Vowel Letters
    map: 'aáâäãå|eéêë|iíîï|oóôöõ|uúûü|yÿ'
    insert: 50
    delete: 50
    replace: 10
  - description: Vowels
    map: 'aáâäãåeéêëiíîïoóôöõuúûüyÿ'
    insert: 50
    delete: 50
    replace: 25 # Replacing one vowel with another is cheap
    swap: 25 # Swapping vowels are cheap
  - description: Multi Character example
    map: 'ß(ss)|œ(ae)|f(ph)'
    replace: 10
  - description: Appending / Removing Accent Marks
    map: '\u0641' # Shadda
    insert: 10
    delete: 10
  - description: Arabic Vowels
    map: '\u064f\u0648\u064e\u0627\u0650\u64a\u0652' # Damma, Wāw, Fatha, Alif, Kasra, Ya', Sukūn
    insert: 20
    delete: 20
    replace: 20
  - description: Keyboard Adjacency
    map: 'qwas|aszx|wesd|sdxc|erdf|dfcv|rtfg|fgvb|tygh|ghbn|yuhj|hjnm|uijk|jkm|iokl|opl'
    replace: 50 # make it cheaper to replace near-by keyboard characters
```

<!---
  cspell:ignore aáâäãå eéêë iíîï oóôöõ uúûü yÿ
  cspell:ignore aáâäãåeéêëiíîïoóôöõuúûüyÿ
  cspell:ignore Shadda Damma Fatha Alif Kasra Sukūn
  cspell:ignore aszx dfcv erdf fgvb ghbn hjnm iokl qwas rtfg sdxc tygh uijk wesd yuhj
-->

# The Algorithm

The current algorithm uses a Levenshtein like algorithm to calculate the edit cost. This is different from
Hunspell which tries to morph the misspelled word in many possible ways to see if it exists in the dictionary. This can be very expensive, therefor it is not used.

## A two step process

The current suggestion mechanism comes up with a list of suggestions in a single pass.

The proposal here is to change the algorithm slightly to come up with a course grain list very quickly and
then to refine it with a more expensive weighted algorithm where the weights can be customized.

Note: the course grain algorithm needs to be very fast because it needs to cull through millions of nodes in
the trie. It should NOT visit all possible words in a trie because of word compounding allowed by some languages effective means that the number of words are infinite.

The current algorithm walks the trie in a depth first manner deciding to not go deeper when the `edit_count`
exceeds the `max_edit_count`. Deeper in this case could also mean linking to a compound root. As it walks,
the `max_edit_count` is adjusted based upon the candidates found. Quickly finding a group of candidates can
help reduce the search time, which is why a depth first search is preferred.

# Notes

## Unicode and Accents

The current dictionary compiler normalizes all unicode strings using `.normalize('NFC')`[^1]. It might be
necessary to allow storage of decomposed characters for

Even though it is composed by default, the dictionaries still contains accent marks.

Node REPL example:

```js
> x = 'ą́'
'ą́'
> x.split('')
[ 'a', '̨', '́' ]
> x.normalize('NFC').split('')
[ 'ą', '́' ]
```

Notice that even though `ą́` was normalized, it still contained an apart accent mark.

[^1]: [String.prototype.normalize - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
