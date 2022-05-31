# `[WIP]` Named Configurations

## Background

CSpell is highly flexible with it configuration, as a result some configurations can be quite complex. CSpell allows layering configuration by importing multiple config files in addition to using conditional configuration provided by `languageSettings` and `overrides`.

The configuration used when spell checking a file is calculated by loading the relevant config files merging them at the top level configuration and then applying matching `overrides` followed by matching `languageSettings`.

Using this technique, nearly every default configuration setting can be overridden when spell checking a specific file.

Order of imports does make a difference. `overrides` are applied in order, followed by `languageSettings`. This means that multiple `overrides` can change the same configuration setting with the last one winning.

Even though it is possible to apply settings based upon conditions in `overrides` and `languageSettings`, it is not possible to conditionally _import_ configuration. An automatic workaround is enabled by dynamically searching for the nearest configuration when checking a file. It is possible to disable dynamically loading the nearest configuration by setting `noConfigSearch` to `true`. Despite this limitation, it is not desireable to allow for _conditional imports_. _Conditional imports_ would introduce a destabilizing effect on configuration calculation and optimization.

## Problem

It is not currently possible to provide groups of settings that can be defined in one configuration file and used conditionally in another.

There are times when a dictionary / plug-in might want to publish multiple configurations or provide the ability to reuse part of a configuration.

Currently configuration can be extended using the `import` setting.

## Benefits of Named Configurations

1. Ability to define re-usable configuration, reducing copy-paste and boiler-plate configs.
1. Ability to disable or redefine named configurations. This is useful for cases when an imported configuration is not desirable for a specific situation.
1. Ability to share finer grain configurations.
