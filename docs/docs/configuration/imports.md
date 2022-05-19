---
parent: Configuration
---

# Importing & Extending Configuration

See the [main configuration page](../configuration.md) for the file names that CSpell use to look for a configuration file. The first configuration file found will be loaded and the others will be ignored.

If you want to use multiple CSpell configuration files, you can use the `import` field, which takes an array of file paths. Each file will be imported in order, with latter configuration files having priority if there are any overlapping fields. In this way, you can merge together two or more configuration files.

## Example

<!-- markdownlint-disable-next-line -->
#### **`cspell.yml`**

```yml
language: fr
import:
  - cspell-a.yml
  - cspell-b.yml
words:
  - root
```

<!-- markdownlint-disable-next-line -->
#### **`cspell-a.yml`**

```yml
dictionaries:
  - aws # enable aws dictionary
  - '!html' # Disable `html` dictionary
words:
  - apple
```

<!-- markdownlint-disable-next-line -->
#### **`cspell-b.yml`**

```yml
language: en
dictionaries:
  - '!softwareTerms' # Disable software-terms dictionary.
  - html # enable html
words:
  - banana
```

This would result in the following merged final config:

```yml
language: fr
dictionaries:
  - aws
  - '!html'
  - '!softwareTerms'
  - html
words:
  - root
  - apple
  - banana
```

When merging, the order of dictionaries does not matter. But the order of the `!`s does matter. In this example, the `html` and `softwareTerms` dictionaries will not be used. Nor will the English dictionary, due to the `language` being `fr`.
