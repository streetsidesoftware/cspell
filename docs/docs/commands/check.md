---
parent: Commands
---

# `check`

Displays the context around a spelling error.

Normally, CSpell will just report that a word is misspelled, but it might be unclear if the word was intentionally spelled that way. In these situations, you can use the `check` command to display the surrounding text of the word to get a bit more information about the context.

```sh
cspell check <filename>
```

It will produce something like this:
![image](https://user-images.githubusercontent.com/3740137/35588848-2a8f1bca-0602-11e8-9cda-fddee2742c35.png)

## Use with `less`

To get color in `less`, use the following flags:

```sh
cspell check <filename> --color | less --raw-control-chars
```

## Options

<!-- Do not copy paste options here, as it can and will become out of date. Instead, use a script in CI to automatically generate Markdown content from the source code directly. -->

You can see the available options for this command in [the source code](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell/src/commandCheck.ts).
