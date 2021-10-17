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

<!--- cspell:ignore paren   -->
