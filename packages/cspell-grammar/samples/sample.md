# This is a smaple Markdown file.

It should contain different bits of Markdown.

- Like both forms of _italics_, _italics_.
- **Bold** text.

<!--- Comments -->

And Code Blocks

```ts
// TypeScript code
const a = 'hello';
```

```markdown
# Even Markdown
```

A text block

    Block
    Of
    Text

A list with samples

- Python
  ```py
  """" This is a comment """"
  # so is this.
  a = 'hello'
  ```
- Markdown

  `````markdown
  # Nested Markdown.

  ````markdown
  # Nested again.

  ```json
  "field": { "num": 0, "string": "hello" }
  ```

  ```ts
  // comment
  const a = 42;
  ```

  ```markdown
  # And Again.
  ```
  ````

  Something else.
  `````

- TypeScript

  ```ts
  // Comment

  function toLower(name: string): string {
    return name.toLowerCase();
  }
  ```

- Another

## Another section.

## Edge Cases

````ts
/*
 This is a comment.
 But we will add a markdown ``` to it: Remove / to break the highlighter.
 /```
 /~~~
*/
const h = 'hello';
````

````markdown
## Heading

- List
  ```ts
  /*
      Typescirpt embedded in Markdown
      */
  a = `
        ~~
         `;
  y = 'h';
  ```

## Heading 2
````

````markdown
- List
  ```ts
  /*
      Typescirpt embedded in Markdown
      */
  a = `
        ~~
         `;
  y = 'h';
  ```

## Heading 2
````
