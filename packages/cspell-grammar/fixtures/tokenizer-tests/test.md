- `"line ( a (b))"`

  | `"line "` | `"("`          | `" a "`  | `"("`          | `"b"`          | `")"`          | `")"`          |
  | --------- | -------------- | -------- | -------------- | -------------- | -------------- | -------------- |
  | source.s  | paren.braces.s | braces.s | paren.braces.s | braces.s       | paren.braces.s | paren.braces.s |
  |           | braces.s       | source.s | braces.s       | paren.braces.s | braces.s       | braces.s       |
  |           | source.s       |          | paren.braces.s | braces.s       | paren.braces.s | source.s       |
  |           |                |          | braces.s       | source.s       | braces.s       |                |
  |           |                |          | source.s       |                | source.s       |                |

- `"line ( a (b))"`

  | text      | scope                                                    |
  | --------- | -------------------------------------------------------- |
  | `"line "` | source.s                                                 |
  | `"("`     | paren.braces.s braces.s source.s                         |
  | `" a "`   | braces.s source.s                                        |
  | `"("`     | paren.braces.s braces.s paren.braces.s braces.s source.s |
  | `"b"`     | braces.s paren.braces.s braces.s source.s                |
  | `")"`     |                                                          |
  | `")"`     |                                                          |

- `0`: <code> const greeting = &quot;hello&quot;;↩</code>

  | text                            | scope                             |
  | ------------------------------- | --------------------------------- |
  | <code> const greeting = </code> | source.ts                         |
  | <code>&quot;</code>             | string.quoted.double.ts source.ts |
  | <code>hello</code>              | string.quoted.double.ts source.ts |
  | <code>&quot;</code>             | string.quoted.double.ts source.ts |
  | <code>;↩</code>                 | source.ts                         |

# Sample TypeScript file

- `0`: <code>import { tokenizedLinesToMarkdown } from &#39;./visualizeAsMD&#39;;↩</code>

  | text                                                   | scope                             |
  | ------------------------------------------------------ | --------------------------------- |
  | <code>import { tokenizedLinesToMarkdown } from </code> | source.ts                         |
  | <code>&#39;</code>                                     | string.quoted.single.ts source.ts |
  | <code>./visualizeAsMD</code>                           | string.quoted.single.ts source.ts |
  | <code>&#39;</code>                                     | string.quoted.single.ts source.ts |
  | <code>;↩</code>                                        | source.ts                         |

- `1`: <code>import { TypeScript } from &#39;../grammars&#39;;↩</code>

  | text                                     | scope                             |
  | ---------------------------------------- | --------------------------------- |
  | <code>import { TypeScript } from </code> | source.ts                         |
  | <code>&#39;</code>                       | string.quoted.single.ts source.ts |
  | <code>../grammars</code>                 | string.quoted.single.ts source.ts |
  | <code>&#39;</code>                       | string.quoted.single.ts source.ts |
  | <code>;↩</code>                          | source.ts                         |

- `2`: <code>import { normalizeGrammar } from &#39;../parser/grammarNormalizer&#39;;↩</code>

  | text                                           | scope                             |
  | ---------------------------------------------- | --------------------------------- |
  | <code>import { normalizeGrammar } from </code> | source.ts                         |
  | <code>&#39;</code>                             | string.quoted.single.ts source.ts |
  | <code>../parser/grammarNormalizer</code>       | string.quoted.single.ts source.ts |
  | <code>&#39;</code>                             | string.quoted.single.ts source.ts |
  | <code>;↩</code>                                | source.ts                         |

- `3`: <code>import { tokenizeText } from &#39;../dist&#39;;↩</code>

  | text                                       | scope                             |
  | ------------------------------------------ | --------------------------------- |
  | <code>import { tokenizeText } from </code> | source.ts                         |
  | <code>&#39;</code>                         | string.quoted.single.ts source.ts |
  | <code>../dist</code>                       | string.quoted.single.ts source.ts |
  | <code>&#39;</code>                         | string.quoted.single.ts source.ts |
  | <code>;↩</code>                            | source.ts                         |

- `4`: <code>↩</code>

  | text           | scope     |
  | -------------- | --------- |
  | <code>↩</code> | source.ts |

- `5`: <code>describe&#40;&#39;visualizeAsMD&#39;, &#40;&#41; =&gt; {↩</code>

  | text                               | scope                             |
  | ---------------------------------- | --------------------------------- |
  | <code>describe&#40;</code>         | source.ts                         |
  | <code>&#39;</code>                 | string.quoted.single.ts source.ts |
  | <code>visualizeAsMD</code>         | string.quoted.single.ts source.ts |
  | <code>&#39;</code>                 | string.quoted.single.ts source.ts |
  | <code>, &#40;&#41; =&gt; {↩</code> | source.ts                         |

- `6`: <code> const gTypeScript = normalizeGrammar&#40;TypeScript.grammar&#41;;↩</code>

  | text                                                                             | scope     |
  | -------------------------------------------------------------------------------- | --------- |
  | <code> const gTypeScript = normalizeGrammar&#40;TypeScript.grammar&#41;;↩</code> | source.ts |

- `7`: <code>↩</code>

  | text           | scope     |
  | -------------- | --------- |
  | <code>↩</code> | source.ts |

- `8`: <code> test.each&#96;↩</code>

  | text                    | scope                        |
  | ----------------------- | ---------------------------- |
  | <code> test.each</code> | source.ts                    |
  | <code>&#96;</code>      | string.template.ts source.ts |
  | <code>↩</code>          | string.template.ts source.ts |

- `9`: <code> lines↩</code>

  | text                 | scope                        |
  | -------------------- | ---------------------------- |
  | <code> lines↩</code> | string.template.ts source.ts |

- `10`: <code> \${tokenize&#40;&#39;&#39;&#41;}↩</code>

  | text                                            | scope                        |
  | ----------------------------------------------- | ---------------------------- |
  | <code> \${tokenize&#40;&#39;&#39;&#41;}↩</code> | string.template.ts source.ts |

- `11`: <code> \${tokenize&#40;&#39;&#92;tconst greeting = &quot;hello&quot;;&#92;n&#39;&#41;}↩</code>

  | text                                             | scope                                                     |
  | ------------------------------------------------ | --------------------------------------------------------- |
  | <code> \${tokenize&#40;&#39;</code>              | string.template.ts source.ts                              |
  | <code>&#92;t</code>                              | constant.character.escape.ts string.template.ts source.ts |
  | <code>const greeting = &quot;hello&quot;;</code> | string.template.ts source.ts                              |
  | <code>&#92;n</code>                              | constant.character.escape.ts string.template.ts source.ts |
  | <code>&#39;&#41;}↩</code>                        | string.template.ts source.ts                              |

- `12`: <code> &#96;&#40;&#39;tokenizedLinesToMarkdown&#39;, &#40;{ lines }&#41; =&gt; {↩</code>

  | text                                        | scope                             |
  | ------------------------------------------- | --------------------------------- |
  | <code> </code>                              | string.template.ts source.ts      |
  | <code>&#96;</code>                          | string.template.ts source.ts      |
  | <code>&#40;</code>                          | source.ts                         |
  | <code>&#39;</code>                          | string.quoted.single.ts source.ts |
  | <code>tokenizedLinesToMarkdown</code>       | string.quoted.single.ts source.ts |
  | <code>&#39;</code>                          | string.quoted.single.ts source.ts |
  | <code>, &#40;{ lines }&#41; =&gt; {↩</code> | source.ts                         |

- `13`: <code> expect&#40;tokenizedLinesToMarkdown&#40;lines&#41;&#41;.toMatchSnapshot&#40;&#41;;↩</code>

  | text                                                                                              | scope     |
  | ------------------------------------------------------------------------------------------------- | --------- |
  | <code> expect&#40;tokenizedLinesToMarkdown&#40;lines&#41;&#41;.toMatchSnapshot&#40;&#41;;↩</code> | source.ts |

- `14`: <code> }&#41;;↩</code>

  | text                   | scope     |
  | ---------------------- | --------- |
  | <code> }&#41;;↩</code> | source.ts |

- `15`: <code>↩</code>

  | text           | scope     |
  | -------------- | --------- |
  | <code>↩</code> | source.ts |

- `16`: <code> function tokenize&#40;text: string&#41; {↩</code>

  | text                                                     | scope     |
  | -------------------------------------------------------- | --------- |
  | <code> function tokenize&#40;text: string&#41; {↩</code> | source.ts |

- `17`: <code> return tokenizeText&#40;text, gTypeScript&#41;;↩</code>

  | text                                                           | scope     |
  | -------------------------------------------------------------- | --------- |
  | <code> return tokenizeText&#40;text, gTypeScript&#41;;↩</code> | source.ts |

- `18`: <code> }↩</code>

  | text             | scope     |
  | ---------------- | --------- |
  | <code> }↩</code> | source.ts |

- `19`: <code>}&#41;;↩</code>

  | text                  | scope     |
  | --------------------- | --------- |
  | <code>}&#41;;↩</code> | source.ts |

<!--- cspell:ignore paren   -->
