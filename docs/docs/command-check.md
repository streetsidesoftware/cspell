---
title: 'Visual Spell Check'
categories: docs
# parent: Docs
nav_order: 4
---

# Visual Spell Check

View the spell checking results in the document being checked.

## Command: `check` - Quick Visual Check

Do a quick visual check of a file. This is a great way to see which text is included in the check.

```sh
cspell check <filename>
```

It will produce something like this:
![image](https://user-images.githubusercontent.com/3740137/35588848-2a8f1bca-0602-11e8-9cda-fddee2742c35.png)

### Tip for use with `less`

To get color in less, use `--color` and `less -r`

```sh
cspell check <filename> --color | less -r
```
