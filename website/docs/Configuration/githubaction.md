---
title: 'Github Action Settings'
sidebar_position: 19
sidebar_label: cspell-action
---

# Github Action Settings

Settings for [cspell-action](https://github.com/streetsidesoftware/cspell-action).

## Github Workflow Job Settings

- `files` -- Define glob patterns to filter the files to be checked. Use a new line between patterns to define multiple patterns. The default is to check ALL files that were changed in in the pull_request or push. Note: `ignorePaths` defined in cspell.json still apply.
- `check_dot_files` -- Check files and directories starting with `.`.
- `root` -- The point in the directory tree to start spell checking which defaults to `.`
- `inline` -- Notification level to use with inline reporting of spelling errors. Allowed values are: warning (default), error, none
- `treat_flagged_words_as_errors` -- Reports flagged / forbidden words as errors.
- `suggestions` -- Generate Spelling suggestions.
- `strict` -- Determines if the action should be failed if any spelling issues are found. Allowed values are: true (default), false.
- `incremental_files_only` -- Limit the files checked to the ones in the pull request or push. Allowed values are: true (default) &, false.
- `config` -- Path to config file ie `cspell.json`.
- `verbose` -- Log progress and other information during the action execution. Allowed values are: true &, false (default).
- `use_cspell_files` -- Use the `files` setting found in the CSpell configuration instead of `input.files`. Allowed values are: true &, false (default).
- `report` -- Set how unknown words are reported. Allowed values are: all (default), simple, typos & flagged.

**Example**

```yaml
- uses: streetsidesoftware/cspell-action@v8
  with:
    # Define glob patterns to filter the files to be checked. Use a new line between patterns to define multiple patterns.
    # The default is to check ALL files that were changed in in the pull_request or push.
    # Note: `ignorePaths` defined in cspell.json still apply.
    # Example:
    # files: |
    #   **/*.{ts,js}
    #   !dist/**/*.{ts,js}
    #
    # Default: ALL files
    files: ''

    # Check files and directories starting with `.`.
    # - "true" - glob searches will match against `.dot` files.
    # - "false" - `.dot` files will NOT be checked.
    # - "explicit" - glob patterns can match explicit `.dot` patterns.
    check_dot_files: explicit

    # The point in the directory tree to start spell checking.
    # Default: .
    root: '.'

    # Notification level to use with inline reporting of spelling errors.
    # Allowed values are: warning, error, none
    # Default: warning
    inline: warning

    # Reports flagged / forbidden words as errors.
    # If true, errors will still be reported even if `inline` is "none"
    treat_flagged_words_as_errors: false

    # Generate Spelling suggestions.
    suggestions: false

    # Determines if the action should be failed if any spelling issues are found.
    # Allowed values are: true, false
    # Default: true
    strict: true

    # Limit the files checked to the ones in the pull request or push.
    incremental_files_only: true

    # Path to `cspell.json`
    config: '.'

    # Log progress and other information during the action execution.
    # Default: false
    verbose: false

    # Use the `files` setting found in the CSpell configuration instead of `input.files`.
    use_cspell_files: false

    # Set how unknown words are reported.
    # Allowed values are: all, simple, typos, flagged
    # Default: all
    report: all
```
