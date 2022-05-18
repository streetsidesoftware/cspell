## Describe the solution you'd like

Adding cspell to existing projects can have a large number of spelling issues. It is not always feasible or possible to correct these issues.

This feature would allow users to ignore known issues while focusing on ensuring that new code is fully spell checked.

## Describe alternatives you've considered

Explicitly adding files to the `overrides` section containing words to be ignored.

## Possible Solutions

### Using an Known Issue File

Using a path or glob pattern followed by the word in ().

```text
django/conf/global_settings.py:108:26 (Luxembourgish)
django/conf/locale/fr/*.py:*:* (octobre)
tests/aggregation_regress/tests.py:728:11 (realiased)
tests/aggregation_regress/tests.py:812:8 (referer)
tests/aggregation_regress/tests.py:915:102 (grep)
```

#### Format:

- `# Comments start with # and are ignored`
- `<path>:<line>:<char> (<word>)`
- `<path>:<line>:<char> (<word>) # optional comment`

**Definitions**

- `<path>`: relative (to the file it is in) path to file.
- `<line>`: line number starting with 1.
- `<char>`: character offset starting with 1.
- `<word>`: the word causing the issue
- `#`: single line comment

### Using `cspell.json` to store known issues

```json
{
  "knownIssues": [
    "django/conf/global_settings.py:108:26 (Luxembourgish)",
    "django/conf/locale/fr/*.py:*:* (octobre)",
    "tests/aggregation_regress/tests.py:728:11 (realiased)",
    "tests/aggregation_regress/tests.py:812:8 (referer)",
    "tests/aggregation_regress/tests.py:915:102 (grep)"
  ]
}
```

### Using `cspell.json` to define known issue file

```json
{
  "knownIssuesFiles": ["path/to/file.txt"]
}
```

## Sample Known Issues Files

### `known-issues.txt`

```text
# cspell:disable
django/conf/global_settings.py:108:26 (Luxembourgish)
django/conf/locale/fr/*.py:*:* (octobre)
tests/aggregation_regress/tests.py:728:11 (realiased)
tests/aggregation_regress/tests.py:812:8 (referer)
tests/aggregation_regress/tests.py:915:102 (grep)
```

<!--- cspell:enable --->

### `known-issues.yaml`

```yaml
# cspell:disable
- django/conf/global_settings.py:108:26 (Luxembourgish)
- django/conf/locale/fr/*.py:*:* (octobre)
- tests/aggregation_regress/tests.py:728:11 (realiased)
- tests/aggregation_regress/tests.py:812:8 (referer)
- tests/aggregation_regress/tests.py:915:102 (grep)
```

<!--- cspell:enable --->

### `known-issues.json`

```jsonc
[
  "# cspell:disable",
  "django/conf/global_settings.py:108:26 (Luxembourgish)",
  "django/conf/locale/fr/*.py:*:* (octobre)",
  "tests/aggregation_regress/tests.py:728:11 (realiased)",
  "tests/aggregation_regress/tests.py:812:8 (referer)",
  "tests/aggregation_regress/tests.py:915:102 (grep)"
]
```

<!--- cspell:enable --->

<!---
cspell:ignore Luxembourgish octobre realiased referer
--->
