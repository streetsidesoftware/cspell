### Kind of Issue

Runtime - command-line tools

### Tool or Library

cspell

### Version

8.2.3

### Supporting Library

Not sure

### OS

Macos

### OS Version

Sonoma 14.2.1

### Description

cspell does not automatically read a configuration file if it is a symlink.

### Steps to Reproduce

1. Define `somenewword` in a simple config file: `cspell.yaml`
2. Confirm it works: `cspell trace somenewword`
3. Rename it: `mv cspell.yaml actual.yaml`
4. Create a symlink to it: `ln -s actual.yaml cspell.yaml`
5. Try using it implicitly: `cspell trace somenewword`. **The config is not loaded.**
6. Use it explicitly: `cspell trace somenewword --config cspell.yaml`. The config is loaded.

### Expected Behavior

cspell finds and reads `cspell.yaml` no matter whether it is a symlink or an actual file.

### Additional Information

_No response_

### cspell.json

_No response_

### cspell.config.yaml

```yml
words:
  - somenewword
```


### Example Repository

_No response_

### Code of Conduct

- [X] I agree to follow this project's Code of Conduct
