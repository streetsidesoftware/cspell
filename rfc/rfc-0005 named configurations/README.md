# `[WIP]` Named Configurations

## Background

CSpell is highly flexible with it configuration, as a result some configurations can be quite complex. CSpell allows layering configuration by importing multiple config files in addition to using conditional configuration provided by `languageSettings` and `overrides`.

The configuration used when spell checking a file is calculated by loading the relevant config files merging them at the top level configuration and then applying matching `overrides` followed by matching `languageSettings`.

Using this technique, nearly every default configuration setting can be overridden when spell checking a specific file.

Order of imports does make a difference. `overrides` are applied in order, followed by `languageSettings`. The means that multiple `overrides` can change the same configuration setting with the last one winning.

## Problem

There are times when a dictionary / plug-in might want to publish multiple configurations or provide the ability to reuse part of a configuration.

Currently configuration can be extended using the `import` setting.

## Benefits of Named Configurations

1. Ability to define re-usable configuration, reducing copy-paste and boiler-plate configs.
1. Ability to disable or redefine named configurations. This is useful for cases when an imported configuration is not desirable for a specific situation.
1. Ability to share finer grain configurations.
