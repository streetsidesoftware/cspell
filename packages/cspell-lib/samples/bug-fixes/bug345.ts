// [CSpell should ignore its own control comments · Issue #345](https://github.com/streetsidesoftware/cspell/issues/345)
// prettier-ignore-start

// cspell:ignoreRegExp "(foobar|foobaz)"

// These should be fine
const tags = ["foobar", "foobaz"] as const;

const foobar = 'but this variable name or the word foobar should still error';

// prettier-ignore-end
