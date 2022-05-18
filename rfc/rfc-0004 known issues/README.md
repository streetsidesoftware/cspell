## Describe the solution you'd like

Adding cspell to existing projects can have a large number of spelling issues. It is not always feasible or possible to correct these issues.

This feature would allow users to ignore known issues while focusing on ensuring that new code is fully spell checked.

## Describe alternatives you've considered

Explicitly adding files to the `overrides` section containing words to be ignored.

## Possible Solution

One solution is to enable defining known issues in two places, the configuration and a known issues file.

The reason for allowing two places in based upon different use cases.

1. A project with only a few legacy known issues. These can be added to the configuration without much bloat.
1. A legacy project with a lots of known issues. Having them in a separate file keeps the configuration clean.

For convenience, it should also be possible to specify a known issues file on the command line.

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

## Keeping Known Issues Up-to-date

Ideally known issues are used for static files that rarely change, but there are many reasons a known issue might not be correct:

- the issue was fixed 🎉.
- the file has been edited and the line or character offset has changed.
- the dictionary was changed and it is no-longer considered an issue.
- the portion of the document is no-longer checked.
- the document is no-longer checked (this is a bit harder to detect).

### Command-line Options

- `--update-known-issues-file` - Reads the known issues file and checks each entry in the file, updating as necessary. It will also add any new issues.

  Format: `--update-known-issues-file=path/to/file.txt`

- `--update-known-issues` - Updates all known issues files. Issues in new files are added to the closest known issue file (the one resulting in the shortest relative path without `../`).
- `--known-issues-file=path/to/file.txt` - be able to specify a know issues file on the command-line.

**_Note:_** it is possible to have multiple known issues files.
**_Note:_** preserving comments in files can be very difficult.

## Reporting on Stale Known issues

If the spell checker encounters a stale known issue, it should report on it. By default, it is a warning and not
It can happen that a known issue gets fixed.

<!---
cspell:ignore Luxembourgish octobre realiased referer
--->
