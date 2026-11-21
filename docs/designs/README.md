# Feature designs

Each folder here is the design of one cspell feature: its decisions and the reasons for them. While a feature is built,
its working notes sit next to it. The code and the docs are the source of truth for how a feature behaves.

Older designs are single files, until one of their decisions changes. They predate the current guide, so don't use them
as a model.

To write one, see:

- [Designing a feature](../feature-design.md): when to write a design, what goes in it, and how to work through it.
- [Design questions](../design-questions.md): the questions a design works through.
- [Design principles](../design-principles.md): what every design is weighed against.

## Designs

| Feature                                     | Description                                                   |
| ------------------------------------------- | ------------------------------------------------------------- |
| [Config search](./config-search/README.md)  | A named config replaces the configs where `cspell lint` runs. |
| [Dictionary locale](./dictionary-locale.md) | Change case by a dictionary's locale when looking up words.   |
| [Glob symlinks](./glob-symlinks.md)         | Follow symbolic links in `cspell lint` glob searches, opt-in. |
