# cspell-trie

Trie library for use with cspell

This library allows easily building of a [Trie](https://en.wikipedia.org/wiki/Trie)
from a word list.

The resulting trie can then be compressed into a
[DAFSA|DAWG](https://en.wikipedia.org/wiki/Deterministic_acyclic_finite_state_automaton).

## Tool

_cspell-trie_ is both a tool and a library.

Give a list of words, _cspell-trie_ will turn it into a _trie_ file.

### Installation

```sh
npm install -g cspell-trie
```

### Usage

```sh
cspell-trie --help
```

### Creating a _trie_ file

```sh
cspell-trie create filename.txt -o filename.trie
```

### Reading a _trie_ file

```sh
cspell-trie reader filename.trie
```

## File Format

### Header

```
TrieXv1
base=10
```

The header has two parts.

- TrieXv1 -- the identifiers
- base -- offsets are stored using the base (10, 16, 32) are common.
  higher the base, the smaller the file. Max is 36

### Data

The first line of data is always a `*`

Each line is a node in the Trie.

The format of each line is:

`star [char index [, char index]*]`

- star - the presence of a star indicates that the node is the ending of a word.
- char - a character that can be appended to the word followed by the node at index.
- index - the offset in the list of nodes to continue appending

In other words, each line has an optional `*` followed by 0 or more (char, index) pairs.
A missing index implies an index of 0, which is the end of word flag.

**Example Line:** `*s1,e` -- The word can stop here, or add an **s** and continue at node _1_, or add an **e**

### Example:

**Word List:**

- walk
- walked
- walker
- walking
- walks
- talk
- talks
- talked
- talker
- talking

becomes

**Output:** (Offsets are added for clarity, but do not exist in output)

```text
Offset  Output
------- --------
        TrieXv1
        base=10
0       *
1       d,r
2       g
3       n2
4       *e1,i3,s
5       k4
6       l5
7       a6
8       t7,w7
```

The root of the trie is the last offset, 8.
It is designed for the entire trie to be in memory, which is why the root is at the end.
This allows for efficiently building the trie as the file loads line by line, because
each line can only refer to previous lines.

How to walk the data to see if "talks" is in it.

1. Start with the root at offset 8.
1. t found goto 7
1. a found goto 6
1. l found goto 5
1. k found goto 4
1. s found stop (goto 0 is stop).

<!---
    cspell:word DAFSA DAWG
-->

## CSpell for Enterprise

<!--- @@inject: ../../static/tidelift.md --->

Available as part of the Tidelift Subscription.

The maintainers of cspell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

<!--- @@inject-end: ../../static/tidelift.md --->

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">
Brought to you by <a href="https://streetsidesoftware.com" title="Street Side Software">
<img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software
</a>
</p>

<!--- @@inject-end: ../../static/footer.md --->
