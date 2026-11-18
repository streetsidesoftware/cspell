# Feature designs

Each folder here is the design of one cspell feature: its decisions and the reasons for them, next to the working notes
used while it was built. Older designs are single files, until one of their decisions changes. The code and the docs are
the source of truth for how a feature behaves.

To write one, see:

- [Designing a feature](../feature-design.md): when to write a design, the file, and how to work through it.
- [Design questions](../design-questions.md): the questions a design works through.
- [Design principles](../design-principles.md): what every design is weighed against.

## Designs

| Feature                                     | Description                                                   |
| ------------------------------------------- | ------------------------------------------------------------- |
| [Dictionary locale](./dictionary-locale.md) | Change case by a dictionary's locale when looking up words.   |
| [Glob symlinks](./glob-symlinks.md)         | Follow symbolic links in `cspell lint` glob searches, opt-in. |
