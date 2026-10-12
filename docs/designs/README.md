# Feature designs

Each file or folder here is the design of one cspell feature. A design is written to think a feature through before
and while it's built, and is finished when the feature merges. It then describes the feature as it was at that point:
what it does, how it behaves, and why it's shaped the way it is. The code and the docs are the source of truth.

To write one, see:

- [Designing a feature](../feature-design.md): when to write a design, the file, and how to work through it.
- [Design questions](../design-questions.md): the questions a design works through.
- [Design principles](../design-principles.md): what every design is weighed against.

## Designs

| Feature                             | Description                                                   |
| ----------------------------------- | ------------------------------------------------------------- |
| [Glob symlinks](./glob-symlinks.md) | Follow symbolic links in `cspell lint` glob searches, opt-in. |
