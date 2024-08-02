# Issue 6025

See: [#6025](https://github.com/streetsidesoftware/cspell/issues/6025)

The Glob Root was not getting correctly set:

Cause: [lint.ts#L406-L409](https://github.com/streetsidesoftware/cspell/pull/6004/files#diff-ef0c79008fac4e61b9dc76115f6847434e3db08e41cc4a8673cf84b35a103306L406-L409)

```diff
    async function run(): Promise<RunResult> {
      if (cfg.options.root) {
-         process.env[ENV_CSPELL_GLOB_ROOT] = cfg.root;
+         setEnvironmentVariable(ENV_CSPELL_GLOB_ROOT, cfg.options.root);
      }
```

`cfg.root` has been resolved, while `cfg.options.root` is still relative.
