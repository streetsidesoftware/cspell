"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/error.js"(exports2) {
    var CommanderError2 = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @constructor
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError2 = class extends CommanderError2 {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       * @constructor
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Argument2 = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @package internal use only
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(`Allowed choices are ${this.argChoices.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument2;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help2 = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        const helpCommand = cmd._getHelpCommand();
        if (helpCommand && !helpCommand._hidden) {
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns number
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const helpOption = cmd._getHelpOption();
        if (helpOption && !helpOption.hidden) {
          const removeShort = helpOption.short && cmd._findOption(helpOption.short);
          const removeLong = helpOption.long && cmd._findOption(helpOption.long);
          if (!removeShort && !removeLong) {
            visibleOptions.push(helpOption);
          } else if (helpOption.long && !removeLong) {
            visibleOptions.push(cmd.createOption(helpOption.long, helpOption.description));
          } else if (helpOption.short && !removeShort) {
            visibleOptions.push(cmd.createOption(helpOption.short, helpOption.description));
          }
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions)
          return [];
        const globalOptions = [];
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          const visibleOptions = ancestorCmd.options.filter((option) => !option.hidden);
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd.registeredArguments.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd.registeredArguments.find((argument) => argument.description)) {
          return cmd.registeredArguments;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args = cmd.registeredArguments.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args ? " " + args : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let ancestorCmdNames = "";
        for (let ancestorCmd = cmd.parent; ancestorCmd; ancestorCmd = ancestorCmd.parent) {
          ancestorCmdNames = ancestorCmd.name() + " " + ancestorCmdNames;
        }
        return ancestorCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([helper.wrap(commandDescription, helpWidth, 0), ""]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(helper.optionTerm(option), helper.optionDescription(option));
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(helper.optionTerm(option), helper.optionDescription(option));
          });
          if (globalOptionList.length > 0) {
            output = output.concat(["Global Options:", formatList(globalOptionList), ""]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(helper.subcommandTerm(cmd2), helper.subcommandDescription(cmd2));
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent))
          return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth)
          return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(`
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`, "g");
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n")
            return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help2;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var Option2 = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {*} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {*} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {(string | string[])} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {Object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @package internal use only
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError2(`Allowed choices are ${this.argChoices.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @package internal use only
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @package internal use only
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {*} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey))
          return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option2;
    exports2.DualOptions = DualOptions;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0)
        return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1)
          return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("events").EventEmitter;
    var childProcess = require("child_process");
    var path = require("path");
    var fs2 = require("fs");
    var process = require("process");
    var { Argument: Argument2, humanReadableArgName } = require_argument();
    var { CommanderError: CommanderError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this.registeredArguments = [];
        this._args = this.registeredArguments;
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process.stdout.write(str),
          writeErr: (str) => process.stderr.write(str),
          getOutHelpWidth: () => process.stdout.isTTY ? process.stdout.columns : void 0,
          getErrHelpWidth: () => process.stderr.isTTY ? process.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._helpOption = void 0;
        this._addImplicitHelpCommand = void 0;
        this._helpCommand = void 0;
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._helpOption = sourceCommand._helpOption;
        this._helpCommand = sourceCommand._helpCommand;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * @returns {Command[]}
       * @private
       */
      _getCommandAndAncestors() {
        const result = [];
        for (let command = this; command; command = command.parent) {
          result.push(command);
        }
        return result;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {(Object|string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {Object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args)
          cmd.arguments(args);
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc)
          return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help2(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {Object} [configuration] - configuration options
       * @return {(Command|Object)} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0)
          return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {Object} [configuration] - configuration options
       * @return {(Command|Object)} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0)
          return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {(boolean|string)} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string")
          displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {Object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden)
          cmd._hidden = true;
        this._registerCommand(cmd);
        cmd.parent = this;
        cmd._checkForBrokenPassThrough();
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument2(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {(Function|*)} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this.registeredArguments.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
        }
        this.registeredArguments.push(argument);
        return this;
      }
      /**
       * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
       *
       *    program.helpCommand('help [cmd]');
       *    program.helpCommand('help [cmd]', 'show help');
       *    program.helpCommand(false); // suppress default help command
       *    program.helpCommand(true); // add help command even if no subcommands
       *
       * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
       * @param {string} [description] - custom description
       * @return {Command} `this` command for chaining
       */
      helpCommand(enableOrNameAndArgs, description) {
        if (typeof enableOrNameAndArgs === "boolean") {
          this._addImplicitHelpCommand = enableOrNameAndArgs;
          return this;
        }
        enableOrNameAndArgs = enableOrNameAndArgs ?? "help [command]";
        const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
        const helpDescription = description ?? "display help for command";
        const helpCommand = this.createCommand(helpName);
        helpCommand.helpOption(false);
        if (helpArgs)
          helpCommand.arguments(helpArgs);
        if (helpDescription)
          helpCommand.description(helpDescription);
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Add prepared custom help command.
       *
       * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
       * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(helpCommand, deprecatedDescription) {
        if (typeof helpCommand !== "object") {
          this.helpCommand(helpCommand, deprecatedDescription);
          return this;
        }
        this._addImplicitHelpCommand = true;
        this._helpCommand = helpCommand;
        return this;
      }
      /**
       * Lazy create help command.
       *
       * @return {(Command|null)}
       * @package
       */
      _getHelpCommand() {
        const hasImplicitHelpCommand = this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help"));
        if (hasImplicitHelpCommand) {
          if (this._helpCommand === void 0) {
            this.helpCommand(void 0, void 0);
          }
          return this._helpCommand;
        }
        return null;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError2(exitCode, code, message));
        }
        process.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this.registeredArguments.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option2(flags, description);
      }
      /**
       * Wrap parseArgs to catch 'commander.invalidArgument'.
       *
       * @param {(Option | Argument)} target
       * @param {string} value
       * @param {*} previous
       * @param {string} invalidArgumentMessage
       * @private
       */
      _callParseArg(target, value, previous, invalidArgumentMessage) {
        try {
          return target.parseArg(value, previous);
        } catch (err) {
          if (err.code === "commander.invalidArgument") {
            const message = `${invalidArgumentMessage} ${err.message}`;
            this.error(message, { exitCode: err.exitCode, code: err.code });
          }
          throw err;
        }
      }
      /**
       * Check for option flag conflicts.
       * Register option if no conflicts found, or throw on conflict.
       *
       * @param {Option} option
       * @api private
       */
      _registerOption(option) {
        const matchingOption = option.short && this._findOption(option.short) || option.long && this._findOption(option.long);
        if (matchingOption) {
          const matchingFlag = option.long && this._findOption(option.long) ? option.long : option.short;
          throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
        }
        this.options.push(option);
      }
      /**
       * Check for command name and alias conflicts with existing commands.
       * Register command if no conflicts found, or throw on conflict.
       *
       * @param {Command} command
       * @api private
       */
      _registerCommand(command) {
        const knownBy = (cmd) => {
          return [cmd.name()].concat(cmd.aliases());
        };
        const alreadyUsed = knownBy(command).find((name) => this._findCommand(name));
        if (alreadyUsed) {
          const existingCmd = knownBy(this._findCommand(alreadyUsed)).join("|");
          const newCmd = knownBy(command).join("|");
          throw new Error(`cannot add command '${newCmd}' as already have command '${existingCmd}'`);
        }
        this.commands.push(command);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        this._registerOption(option);
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(name, option.defaultValue === void 0 ? true : option.defaultValue, "default");
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            val = this._callParseArg(option, val, oldValue, invalidValueMessage);
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @private
       */
      _optionEx(config, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option2) {
          throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
       *
       * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
       * option-argument is indicated by `<>` and an optional option-argument by `[]`.
       *
       * See the README for more details, and see also addOption() and requiredOption().
       *
       * @example
       * program
       *     .option('-p, --pepper', 'add pepper')
       *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
       *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
       *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {(Function|*)} [parseArg] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, parseArg, defaultValue) {
        return this._optionEx({}, flags, description, parseArg, defaultValue);
      }
      /**
      * Add a required option which must have a value after parsing. This usually means
      * the option must be specified on the command line. (Otherwise the same as .option().)
      *
      * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
      *
      * @param {string} flags
      * @param {string} [description]
      * @param {(Function|*)} [parseArg] - custom option processing function or default value
      * @param {*} [defaultValue]
      * @return {Command} `this` command for chaining
      */
      requiredOption(flags, description, parseArg, defaultValue) {
        return this._optionEx({ mandatory: true }, flags, description, parseArg, defaultValue);
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {boolean} [combine=true] - if `true` or omitted, an optional value can be specified directly after the flag.
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {boolean} [allowUnknown=true] - if `true` or omitted, no error will be thrown
       * for unknown options.
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {boolean} [allowExcess=true] - if `true` or omitted, no error will be thrown
       * for excess arguments.
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {boolean} [positional=true]
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {boolean} [passThrough=true]
       * for unknown options.
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        this._checkForBrokenPassThrough();
        return this;
      }
      /**
       * @private
       */
      _checkForBrokenPassThrough() {
        if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) {
          throw new Error(`passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`);
        }
      }
      /**
        * Whether to store option values as properties on command object,
        * or store separately (specify false). In both cases the option values can be accessed using .opts().
        *
        * @param {boolean} [storeAsProperties=true]
        * @return {Command} `this` command for chaining
        */
      storeOptionsAsProperties(storeAsProperties = true) {
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        if (Object.keys(this._optionValues).length) {
          throw new Error("call .storeOptionsAsProperties() before setting option values");
        }
        this._storeOptionsAsProperties = !!storeAsProperties;
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {Object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {Object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
        * Store option value and where the value came from.
        *
        * @param {string} key
        * @param {Object} value
        * @param {string} source - expected values are default/config/env/cli/implied
        * @return {Command} `this` command for chaining
        */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
        * Get source of option value.
        * Expected values are default | config | env | cli | implied
        *
        * @param {string} key
        * @return {string}
        */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
        * Get source of option value. See also .optsWithGlobals().
        * Expected values are default | config | env | cli | implied
        *
        * @param {string} key
        * @return {string}
        */
      getOptionValueSourceWithGlobals(key) {
        let source;
        this._getCommandAndAncestors().forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0) {
          argv = process.argv;
          if (process.versions && process.versions.electron) {
            parseOptions.from = "electron";
          }
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          default:
            throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * The default expectation is that the arguments are from node and have the application as argv[0]
       * and the script being run in argv[1], with user parameters after that.
       *
       * @example
       * program.parse(process.argv);
       * program.parse(); // implicitly use process.argv and auto-detect node vs electron conventions
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {Object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async. Returns a Promise.
       *
       * The default expectation is that the arguments are from node and have the application as argv[0]
       * and the script being run in argv[1], with user parameters after that.
       *
       * @example
       * await program.parseAsync(process.argv);
       * await program.parseAsync(); // implicitly use process.argv and auto-detect node vs electron conventions
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {Object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @private
       */
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs2.existsSync(localBin))
            return localBin;
          if (sourceExt.includes(path.extname(baseName)))
            return void 0;
          const foundExt = sourceExt.find((ext) => fs2.existsSync(`${localBin}${ext}`));
          if (foundExt)
            return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs2.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
            if (legacyName !== this._name) {
              localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(executableFile);
            args = incrementNodeInspectorPort(process.execArgv).concat(args);
            proc = childProcess.spawn(process.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(executableFile);
          args = incrementNodeInspectorPort(process.execArgv).concat(args);
          proc = childProcess.spawn(process.execPath, args, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        proc.on("close", (code, _signal) => {
          code = code ?? 1;
          if (!exitCallback) {
            process.exit(code);
          } else {
            exitCallback(new CommanderError2(code, "commander.executeSubCommandAsync", "(close)"));
          }
        });
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process.exit(1);
          } else {
            const wrappedError = new CommanderError2(1, "commander.executeSubCommandAsync", "(error)");
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand)
          this.help({ error: true });
        let promiseChain;
        promiseChain = this._chainOrCallSubCommandHook(promiseChain, subCommand, "preSubcommand");
        promiseChain = this._chainOrCall(promiseChain, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return promiseChain;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(subcommandName, [], [
          this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"
        ]);
      }
      /**
       * Check this.args against expected this.registeredArguments.
       *
       * @private
       */
      _checkNumberOfArguments() {
        this.registeredArguments.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) {
          return;
        }
        if (this.args.length > this.registeredArguments.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this.registeredArguments and save as this.processedArgs!
       *
       * @private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
            parsedValue = this._callParseArg(argument, value, previous, invalidValueMessage);
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this.registeredArguments.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {(Promise|undefined)} promise
       * @param {Function} fn
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        this._getCommandAndAncestors().reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {(Promise|undefined)} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {(Promise|undefined)}
       * @private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._getHelpCommand() && operands[0] === this._getHelpCommand().name()) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          this._outputHelpIfRequested(unknown);
          return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        this._outputHelpIfRequested(parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let promiseChain;
          promiseChain = this._chainOrCallHooks(promiseChain, "preAction");
          promiseChain = this._chainOrCall(promiseChain, () => this._actionHandler(this.processedArgs));
          if (this.parent) {
            promiseChain = this._chainOrCall(promiseChain, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          promiseChain = this._chainOrCallHooks(promiseChain, "postAction");
          return promiseChain;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @private
       */
      _findCommand(name) {
        if (!name)
          return void 0;
        return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @package internal use only
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForMissingMandatoryOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        });
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter(
          (option) => {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0) {
              return false;
            }
            return this.getOptionValueSource(optionKey) !== "default";
          }
        );
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @private
       */
      _checkForConflictingOptions() {
        this._getCommandAndAncestors().forEach((cmd) => {
          cmd._checkForConflictingLocalOptions();
        });
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {string[]} argv
       * @return {{operands: string[], unknown: string[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown)
              dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0)
                  this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0)
                unknown.push(...args);
              break;
            } else if (this._getHelpCommand() && arg === this._getHelpCommand().name()) {
              operands.push(arg);
              if (args.length > 0)
                operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0)
                unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0)
              dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {Object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {Object}
       */
      optsWithGlobals() {
        return this._getCommandAndAncestors().reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {Object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config = errorOptions || {};
        const exitCode = config.exitCode || 1;
        const code = config.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter((option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
          const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption)
          return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments)
          return;
        const expected = this.registeredArguments.length;
        const s2 = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s2} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias())
              candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Get or set the program version.
       *
       * This method auto-registers the "-V, --version" option which will print the version number.
       *
       * You can optionally supply the flags and description to override the defaults.
       *
       * @param {string} [str]
       * @param {string} [flags]
       * @param {string} [description]
       * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0)
          return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this._registerOption(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {Object} [argsDescription]
       * @return {(string|Command)}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      summary(str) {
        if (str === void 0)
          return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {(string|Command)}
       */
      alias(alias) {
        if (alias === void 0)
          return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        const matchingCommand = this.parent?._findCommand(alias);
        if (matchingCommand) {
          const existingCmd = [matchingCommand.name()].concat(matchingCommand.aliases()).join("|");
          throw new Error(`cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`);
        }
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {(string[]|Command)}
       */
      aliases(aliases) {
        if (aliases === void 0)
          return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage)
            return this._usage;
          const args = this.registeredArguments.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._helpOption !== null ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this.registeredArguments.length ? args : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {(string|Command)}
       */
      name(str) {
        if (str === void 0)
          return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {(string|null|Command)}
       */
      executableDir(path2) {
        if (path2 === void 0)
          return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        this._getCommandAndAncestors().reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        if (this._getHelpOption()?.long) {
          this.emit(this._getHelpOption().long);
        }
        this.emit("afterHelp", context);
        this._getCommandAndAncestors().forEach((command) => command.emit("afterAllHelp", context));
      }
      /**
       * You can pass in flags and a description to customise the built-in help option.
       * Pass in false to disable the built-in help option.
       *
       * @example
       * program.helpOption('-?, --help' 'show help'); // customise
       * program.helpOption(false); // disable
       *
       * @param {(string | boolean)} flags
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          if (flags) {
            this._helpOption = this._helpOption ?? void 0;
          } else {
            this._helpOption = null;
          }
          return this;
        }
        flags = flags ?? "-h, --help";
        description = description ?? "display help for command";
        this._helpOption = this.createOption(flags, description);
        return this;
      }
      /**
       * Lazy create help option.
       * Returns null if has been disabled with .helpOption(false).
       *
       * @returns {(Option | null)} the help option
       * @package internal use only
       */
      _getHelpOption() {
        if (this._helpOption === void 0) {
          this.helpOption(void 0, void 0);
        }
        return this._helpOption;
      }
      /**
       * Supply your own option to use for the built-in help option.
       * This is an alternative to using helpOption() to customise the flags and description etc.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addHelpOption(option) {
        this._helpOption = option;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {(string | Function)} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
      /**
       * Output help information if help flags specified
       *
       * @param {Array} args - array of options to search for help flags
       * @private
       */
      _outputHelpIfRequested(args) {
        const helpOption = this._getHelpOption();
        const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
        if (helpRequested) {
          this.outputHelp();
          this._exit(0, "commander.helpDisplayed", "(outputHelp)");
        }
      }
    };
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    exports2.Command = Command2;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/index.js
var require_commander = __commonJS({
  "../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/index.js"(exports2) {
    var { Argument: Argument2 } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError: CommanderError2, InvalidArgumentError: InvalidArgumentError2 } = require_error();
    var { Help: Help2 } = require_help();
    var { Option: Option2 } = require_option();
    exports2.program = new Command2();
    exports2.createCommand = (name) => new Command2(name);
    exports2.createOption = (flags, description) => new Option2(flags, description);
    exports2.createArgument = (name, description) => new Argument2(name, description);
    exports2.Command = Command2;
    exports2.Option = Option2;
    exports2.Argument = Argument2;
    exports2.Help = Help2;
    exports2.CommanderError = CommanderError2;
    exports2.InvalidArgumentError = InvalidArgumentError2;
    exports2.InvalidOptionArgumentError = InvalidArgumentError2;
  }
});

// ../../node_modules/.pnpm/commander@12.0.0/node_modules/commander/esm.mjs
var import_index = __toESM(require_commander(), 1);
var {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError,
  // deprecated old name
  Command,
  Argument,
  Option,
  Help
} = import_index.default;

// src/perfChart.ts
var import_node_fs = require("node:fs");

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/api/CsvError.js
var CsvError = class _CsvError extends Error {
  constructor(code, message, options, ...contexts) {
    if (Array.isArray(message))
      message = message.join(" ").trim();
    super(message);
    if (Error.captureStackTrace !== void 0) {
      Error.captureStackTrace(this, _CsvError);
    }
    this.code = code;
    for (const context of contexts) {
      for (const key in context) {
        const value = context[key];
        this[key] = Buffer.isBuffer(value) ? value.toString(options.encoding) : value == null ? value : JSON.parse(JSON.stringify(value));
      }
    }
  }
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/utils/is_object.js
var is_object = function(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/api/normalize_columns_array.js
var normalize_columns_array = function(columns) {
  const normalizedColumns = [];
  for (let i = 0, l = columns.length; i < l; i++) {
    const column = columns[i];
    if (column === void 0 || column === null || column === false) {
      normalizedColumns[i] = { disabled: true };
    } else if (typeof column === "string") {
      normalizedColumns[i] = { name: column };
    } else if (is_object(column)) {
      if (typeof column.name !== "string") {
        throw new CsvError("CSV_OPTION_COLUMNS_MISSING_NAME", [
          "Option columns missing name:",
          `property "name" is required at position ${i}`,
          "when column is an object literal"
        ]);
      }
      normalizedColumns[i] = column;
    } else {
      throw new CsvError("CSV_INVALID_COLUMN_DEFINITION", [
        "Invalid column definition:",
        "expect a string or a literal object,",
        `got ${JSON.stringify(column)} at position ${i}`
      ]);
    }
  }
  return normalizedColumns;
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/utils/ResizeableBuffer.js
var ResizeableBuffer = class {
  constructor(size = 100) {
    this.size = size;
    this.length = 0;
    this.buf = Buffer.allocUnsafe(size);
  }
  prepend(val) {
    if (Buffer.isBuffer(val)) {
      const length = this.length + val.length;
      if (length >= this.size) {
        this.resize();
        if (length >= this.size) {
          throw Error("INVALID_BUFFER_STATE");
        }
      }
      const buf = this.buf;
      this.buf = Buffer.allocUnsafe(this.size);
      val.copy(this.buf, 0);
      buf.copy(this.buf, val.length);
      this.length += val.length;
    } else {
      const length = this.length++;
      if (length === this.size) {
        this.resize();
      }
      const buf = this.clone();
      this.buf[0] = val;
      buf.copy(this.buf, 1, 0, length);
    }
  }
  append(val) {
    const length = this.length++;
    if (length === this.size) {
      this.resize();
    }
    this.buf[length] = val;
  }
  clone() {
    return Buffer.from(this.buf.slice(0, this.length));
  }
  resize() {
    const length = this.length;
    this.size = this.size * 2;
    const buf = Buffer.allocUnsafe(this.size);
    this.buf.copy(buf, 0, 0, length);
    this.buf = buf;
  }
  toString(encoding) {
    if (encoding) {
      return this.buf.slice(0, this.length).toString(encoding);
    } else {
      return Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
    }
  }
  toJSON() {
    return this.toString("utf8");
  }
  reset() {
    this.length = 0;
  }
};
var ResizeableBuffer_default = ResizeableBuffer;

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/api/init_state.js
var np = 12;
var cr = 13;
var nl = 10;
var space = 32;
var tab = 9;
var init_state = function(options) {
  return {
    bomSkipped: false,
    bufBytesStart: 0,
    castField: options.cast_function,
    commenting: false,
    // Current error encountered by a record
    error: void 0,
    enabled: options.from_line === 1,
    escaping: false,
    escapeIsQuote: Buffer.isBuffer(options.escape) && Buffer.isBuffer(options.quote) && Buffer.compare(options.escape, options.quote) === 0,
    // columns can be `false`, `true`, `Array`
    expectedRecordLength: Array.isArray(options.columns) ? options.columns.length : void 0,
    field: new ResizeableBuffer_default(20),
    firstLineToHeaders: options.cast_first_line_to_header,
    needMoreDataSize: Math.max(
      // Skip if the remaining buffer smaller than comment
      options.comment !== null ? options.comment.length : 0,
      ...options.delimiter.map((delimiter) => delimiter.length),
      // Skip if the remaining buffer can be escape sequence
      options.quote !== null ? options.quote.length : 0
    ),
    previousBuf: void 0,
    quoting: false,
    stop: false,
    rawBuffer: new ResizeableBuffer_default(100),
    record: [],
    recordHasError: false,
    record_length: 0,
    recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 0 : Math.max(...options.record_delimiter.map((v) => v.length)),
    trimChars: [Buffer.from(" ", options.encoding)[0], Buffer.from("	", options.encoding)[0]],
    wasQuoting: false,
    wasRowDelimiter: false,
    timchars: [
      Buffer.from(Buffer.from([cr], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([nl], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([np], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([space], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([tab], "utf8").toString(), options.encoding)
    ]
  };
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/utils/underscore.js
var underscore = function(str) {
  return str.replace(/([A-Z])/g, function(_, match) {
    return "_" + match.toLowerCase();
  });
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/api/normalize_options.js
var normalize_options = function(opts) {
  const options = {};
  for (const opt in opts) {
    options[underscore(opt)] = opts[opt];
  }
  if (options.encoding === void 0 || options.encoding === true) {
    options.encoding = "utf8";
  } else if (options.encoding === null || options.encoding === false) {
    options.encoding = null;
  } else if (typeof options.encoding !== "string" && options.encoding !== null) {
    throw new CsvError("CSV_INVALID_OPTION_ENCODING", [
      "Invalid option encoding:",
      "encoding must be a string or null to return a buffer,",
      `got ${JSON.stringify(options.encoding)}`
    ], options);
  }
  if (options.bom === void 0 || options.bom === null || options.bom === false) {
    options.bom = false;
  } else if (options.bom !== true) {
    throw new CsvError("CSV_INVALID_OPTION_BOM", [
      "Invalid option bom:",
      "bom must be true,",
      `got ${JSON.stringify(options.bom)}`
    ], options);
  }
  options.cast_function = null;
  if (options.cast === void 0 || options.cast === null || options.cast === false || options.cast === "") {
    options.cast = void 0;
  } else if (typeof options.cast === "function") {
    options.cast_function = options.cast;
    options.cast = true;
  } else if (options.cast !== true) {
    throw new CsvError("CSV_INVALID_OPTION_CAST", [
      "Invalid option cast:",
      "cast must be true or a function,",
      `got ${JSON.stringify(options.cast)}`
    ], options);
  }
  if (options.cast_date === void 0 || options.cast_date === null || options.cast_date === false || options.cast_date === "") {
    options.cast_date = false;
  } else if (options.cast_date === true) {
    options.cast_date = function(value) {
      const date = Date.parse(value);
      return !isNaN(date) ? new Date(date) : value;
    };
  } else if (typeof options.cast_date !== "function") {
    throw new CsvError("CSV_INVALID_OPTION_CAST_DATE", [
      "Invalid option cast_date:",
      "cast_date must be true or a function,",
      `got ${JSON.stringify(options.cast_date)}`
    ], options);
  }
  options.cast_first_line_to_header = null;
  if (options.columns === true) {
    options.cast_first_line_to_header = void 0;
  } else if (typeof options.columns === "function") {
    options.cast_first_line_to_header = options.columns;
    options.columns = true;
  } else if (Array.isArray(options.columns)) {
    options.columns = normalize_columns_array(options.columns);
  } else if (options.columns === void 0 || options.columns === null || options.columns === false) {
    options.columns = false;
  } else {
    throw new CsvError("CSV_INVALID_OPTION_COLUMNS", [
      "Invalid option columns:",
      "expect an array, a function or true,",
      `got ${JSON.stringify(options.columns)}`
    ], options);
  }
  if (options.group_columns_by_name === void 0 || options.group_columns_by_name === null || options.group_columns_by_name === false) {
    options.group_columns_by_name = false;
  } else if (options.group_columns_by_name !== true) {
    throw new CsvError("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
      "Invalid option group_columns_by_name:",
      "expect an boolean,",
      `got ${JSON.stringify(options.group_columns_by_name)}`
    ], options);
  } else if (options.columns === false) {
    throw new CsvError("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
      "Invalid option group_columns_by_name:",
      "the `columns` mode must be activated."
    ], options);
  }
  if (options.comment === void 0 || options.comment === null || options.comment === false || options.comment === "") {
    options.comment = null;
  } else {
    if (typeof options.comment === "string") {
      options.comment = Buffer.from(options.comment, options.encoding);
    }
    if (!Buffer.isBuffer(options.comment)) {
      throw new CsvError("CSV_INVALID_OPTION_COMMENT", [
        "Invalid option comment:",
        "comment must be a buffer or a string,",
        `got ${JSON.stringify(options.comment)}`
      ], options);
    }
  }
  if (options.comment_no_infix === void 0 || options.comment_no_infix === null || options.comment_no_infix === false) {
    options.comment_no_infix = false;
  } else if (options.comment_no_infix !== true) {
    throw new CsvError("CSV_INVALID_OPTION_COMMENT", [
      "Invalid option comment_no_infix:",
      "value must be a boolean,",
      `got ${JSON.stringify(options.comment_no_infix)}`
    ], options);
  }
  const delimiter_json = JSON.stringify(options.delimiter);
  if (!Array.isArray(options.delimiter))
    options.delimiter = [options.delimiter];
  if (options.delimiter.length === 0) {
    throw new CsvError("CSV_INVALID_OPTION_DELIMITER", [
      "Invalid option delimiter:",
      "delimiter must be a non empty string or buffer or array of string|buffer,",
      `got ${delimiter_json}`
    ], options);
  }
  options.delimiter = options.delimiter.map(function(delimiter) {
    if (delimiter === void 0 || delimiter === null || delimiter === false) {
      return Buffer.from(",", options.encoding);
    }
    if (typeof delimiter === "string") {
      delimiter = Buffer.from(delimiter, options.encoding);
    }
    if (!Buffer.isBuffer(delimiter) || delimiter.length === 0) {
      throw new CsvError("CSV_INVALID_OPTION_DELIMITER", [
        "Invalid option delimiter:",
        "delimiter must be a non empty string or buffer or array of string|buffer,",
        `got ${delimiter_json}`
      ], options);
    }
    return delimiter;
  });
  if (options.escape === void 0 || options.escape === true) {
    options.escape = Buffer.from('"', options.encoding);
  } else if (typeof options.escape === "string") {
    options.escape = Buffer.from(options.escape, options.encoding);
  } else if (options.escape === null || options.escape === false) {
    options.escape = null;
  }
  if (options.escape !== null) {
    if (!Buffer.isBuffer(options.escape)) {
      throw new Error(`Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options.escape)}`);
    }
  }
  if (options.from === void 0 || options.from === null) {
    options.from = 1;
  } else {
    if (typeof options.from === "string" && /\d+/.test(options.from)) {
      options.from = parseInt(options.from);
    }
    if (Number.isInteger(options.from)) {
      if (options.from < 0) {
        throw new Error(`Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`);
      }
    } else {
      throw new Error(`Invalid Option: from must be an integer, got ${JSON.stringify(options.from)}`);
    }
  }
  if (options.from_line === void 0 || options.from_line === null) {
    options.from_line = 1;
  } else {
    if (typeof options.from_line === "string" && /\d+/.test(options.from_line)) {
      options.from_line = parseInt(options.from_line);
    }
    if (Number.isInteger(options.from_line)) {
      if (options.from_line <= 0) {
        throw new Error(`Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`);
      }
    } else {
      throw new Error(`Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`);
    }
  }
  if (options.ignore_last_delimiters === void 0 || options.ignore_last_delimiters === null) {
    options.ignore_last_delimiters = false;
  } else if (typeof options.ignore_last_delimiters === "number") {
    options.ignore_last_delimiters = Math.floor(options.ignore_last_delimiters);
    if (options.ignore_last_delimiters === 0) {
      options.ignore_last_delimiters = false;
    }
  } else if (typeof options.ignore_last_delimiters !== "boolean") {
    throw new CsvError("CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS", [
      "Invalid option `ignore_last_delimiters`:",
      "the value must be a boolean value or an integer,",
      `got ${JSON.stringify(options.ignore_last_delimiters)}`
    ], options);
  }
  if (options.ignore_last_delimiters === true && options.columns === false) {
    throw new CsvError("CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS", [
      "The option `ignore_last_delimiters`",
      "requires the activation of the `columns` option"
    ], options);
  }
  if (options.info === void 0 || options.info === null || options.info === false) {
    options.info = false;
  } else if (options.info !== true) {
    throw new Error(`Invalid Option: info must be true, got ${JSON.stringify(options.info)}`);
  }
  if (options.max_record_size === void 0 || options.max_record_size === null || options.max_record_size === false) {
    options.max_record_size = 0;
  } else if (Number.isInteger(options.max_record_size) && options.max_record_size >= 0) {
  } else if (typeof options.max_record_size === "string" && /\d+/.test(options.max_record_size)) {
    options.max_record_size = parseInt(options.max_record_size);
  } else {
    throw new Error(`Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options.max_record_size)}`);
  }
  if (options.objname === void 0 || options.objname === null || options.objname === false) {
    options.objname = void 0;
  } else if (Buffer.isBuffer(options.objname)) {
    if (options.objname.length === 0) {
      throw new Error(`Invalid Option: objname must be a non empty buffer`);
    }
    if (options.encoding === null) {
    } else {
      options.objname = options.objname.toString(options.encoding);
    }
  } else if (typeof options.objname === "string") {
    if (options.objname.length === 0) {
      throw new Error(`Invalid Option: objname must be a non empty string`);
    }
  } else if (typeof options.objname === "number") {
  } else {
    throw new Error(`Invalid Option: objname must be a string or a buffer, got ${options.objname}`);
  }
  if (options.objname !== void 0) {
    if (typeof options.objname === "number") {
      if (options.columns !== false) {
        throw Error("Invalid Option: objname index cannot be combined with columns or be defined as a field");
      }
    } else {
      if (options.columns === false) {
        throw Error("Invalid Option: objname field must be combined with columns or be defined as an index");
      }
    }
  }
  if (options.on_record === void 0 || options.on_record === null) {
    options.on_record = void 0;
  } else if (typeof options.on_record !== "function") {
    throw new CsvError("CSV_INVALID_OPTION_ON_RECORD", [
      "Invalid option `on_record`:",
      "expect a function,",
      `got ${JSON.stringify(options.on_record)}`
    ], options);
  }
  if (options.quote === null || options.quote === false || options.quote === "") {
    options.quote = null;
  } else {
    if (options.quote === void 0 || options.quote === true) {
      options.quote = Buffer.from('"', options.encoding);
    } else if (typeof options.quote === "string") {
      options.quote = Buffer.from(options.quote, options.encoding);
    }
    if (!Buffer.isBuffer(options.quote)) {
      throw new Error(`Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options.quote)}`);
    }
  }
  if (options.raw === void 0 || options.raw === null || options.raw === false) {
    options.raw = false;
  } else if (options.raw !== true) {
    throw new Error(`Invalid Option: raw must be true, got ${JSON.stringify(options.raw)}`);
  }
  if (options.record_delimiter === void 0) {
    options.record_delimiter = [];
  } else if (typeof options.record_delimiter === "string" || Buffer.isBuffer(options.record_delimiter)) {
    if (options.record_delimiter.length === 0) {
      throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
        "Invalid option `record_delimiter`:",
        "value must be a non empty string or buffer,",
        `got ${JSON.stringify(options.record_delimiter)}`
      ], options);
    }
    options.record_delimiter = [options.record_delimiter];
  } else if (!Array.isArray(options.record_delimiter)) {
    throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
      "Invalid option `record_delimiter`:",
      "value must be a string, a buffer or array of string|buffer,",
      `got ${JSON.stringify(options.record_delimiter)}`
    ], options);
  }
  options.record_delimiter = options.record_delimiter.map(function(rd, i) {
    if (typeof rd !== "string" && !Buffer.isBuffer(rd)) {
      throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
        "Invalid option `record_delimiter`:",
        "value must be a string, a buffer or array of string|buffer",
        `at index ${i},`,
        `got ${JSON.stringify(rd)}`
      ], options);
    } else if (rd.length === 0) {
      throw new CsvError("CSV_INVALID_OPTION_RECORD_DELIMITER", [
        "Invalid option `record_delimiter`:",
        "value must be a non empty string or buffer",
        `at index ${i},`,
        `got ${JSON.stringify(rd)}`
      ], options);
    }
    if (typeof rd === "string") {
      rd = Buffer.from(rd, options.encoding);
    }
    return rd;
  });
  if (typeof options.relax_column_count === "boolean") {
  } else if (options.relax_column_count === void 0 || options.relax_column_count === null) {
    options.relax_column_count = false;
  } else {
    throw new Error(`Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options.relax_column_count)}`);
  }
  if (typeof options.relax_column_count_less === "boolean") {
  } else if (options.relax_column_count_less === void 0 || options.relax_column_count_less === null) {
    options.relax_column_count_less = false;
  } else {
    throw new Error(`Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options.relax_column_count_less)}`);
  }
  if (typeof options.relax_column_count_more === "boolean") {
  } else if (options.relax_column_count_more === void 0 || options.relax_column_count_more === null) {
    options.relax_column_count_more = false;
  } else {
    throw new Error(`Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options.relax_column_count_more)}`);
  }
  if (typeof options.relax_quotes === "boolean") {
  } else if (options.relax_quotes === void 0 || options.relax_quotes === null) {
    options.relax_quotes = false;
  } else {
    throw new Error(`Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(options.relax_quotes)}`);
  }
  if (typeof options.skip_empty_lines === "boolean") {
  } else if (options.skip_empty_lines === void 0 || options.skip_empty_lines === null) {
    options.skip_empty_lines = false;
  } else {
    throw new Error(`Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options.skip_empty_lines)}`);
  }
  if (typeof options.skip_records_with_empty_values === "boolean") {
  } else if (options.skip_records_with_empty_values === void 0 || options.skip_records_with_empty_values === null) {
    options.skip_records_with_empty_values = false;
  } else {
    throw new Error(`Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(options.skip_records_with_empty_values)}`);
  }
  if (typeof options.skip_records_with_error === "boolean") {
  } else if (options.skip_records_with_error === void 0 || options.skip_records_with_error === null) {
    options.skip_records_with_error = false;
  } else {
    throw new Error(`Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(options.skip_records_with_error)}`);
  }
  if (options.rtrim === void 0 || options.rtrim === null || options.rtrim === false) {
    options.rtrim = false;
  } else if (options.rtrim !== true) {
    throw new Error(`Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options.rtrim)}`);
  }
  if (options.ltrim === void 0 || options.ltrim === null || options.ltrim === false) {
    options.ltrim = false;
  } else if (options.ltrim !== true) {
    throw new Error(`Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options.ltrim)}`);
  }
  if (options.trim === void 0 || options.trim === null || options.trim === false) {
    options.trim = false;
  } else if (options.trim !== true) {
    throw new Error(`Invalid Option: trim must be a boolean, got ${JSON.stringify(options.trim)}`);
  }
  if (options.trim === true && opts.ltrim !== false) {
    options.ltrim = true;
  } else if (options.ltrim !== true) {
    options.ltrim = false;
  }
  if (options.trim === true && opts.rtrim !== false) {
    options.rtrim = true;
  } else if (options.rtrim !== true) {
    options.rtrim = false;
  }
  if (options.to === void 0 || options.to === null) {
    options.to = -1;
  } else {
    if (typeof options.to === "string" && /\d+/.test(options.to)) {
      options.to = parseInt(options.to);
    }
    if (Number.isInteger(options.to)) {
      if (options.to <= 0) {
        throw new Error(`Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`);
      }
    } else {
      throw new Error(`Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`);
    }
  }
  if (options.to_line === void 0 || options.to_line === null) {
    options.to_line = -1;
  } else {
    if (typeof options.to_line === "string" && /\d+/.test(options.to_line)) {
      options.to_line = parseInt(options.to_line);
    }
    if (Number.isInteger(options.to_line)) {
      if (options.to_line <= 0) {
        throw new Error(`Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`);
      }
    } else {
      throw new Error(`Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`);
    }
  }
  return options;
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/api/index.js
var isRecordEmpty = function(record) {
  return record.every((field) => field == null || field.toString && field.toString().trim() === "");
};
var cr2 = 13;
var nl2 = 10;
var boms = {
  // Note, the following are equals:
  // Buffer.from("\ufeff")
  // Buffer.from([239, 187, 191])
  // Buffer.from('EFBBBF', 'hex')
  "utf8": Buffer.from([239, 187, 191]),
  // Note, the following are equals:
  // Buffer.from "\ufeff", 'utf16le
  // Buffer.from([255, 254])
  "utf16le": Buffer.from([255, 254])
};
var transform = function(original_options = {}) {
  const info = {
    bytes: 0,
    comment_lines: 0,
    empty_lines: 0,
    invalid_field_length: 0,
    lines: 1,
    records: 0
  };
  const options = normalize_options(original_options);
  return {
    info,
    original_options,
    options,
    state: init_state(options),
    __needMoreData: function(i, bufLen, end) {
      if (end)
        return false;
      const { encoding, escape, quote } = this.options;
      const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
      const numOfCharLeft = bufLen - i - 1;
      const requiredLength = Math.max(
        needMoreDataSize,
        // Skip if the remaining buffer smaller than record delimiter
        // If "record_delimiter" is yet to be discovered:
        // 1. It is equals to `[]` and "recordDelimiterMaxLength" equals `0`
        // 2. We set the length to windows line ending in the current encoding
        // Note, that encoding is known from user or bom discovery at that point
        // recordDelimiterMaxLength,
        recordDelimiterMaxLength === 0 ? Buffer.from("\r\n", encoding).length : recordDelimiterMaxLength,
        // Skip if remaining buffer can be an escaped quote
        quoting ? (escape === null ? 0 : escape.length) + quote.length : 0,
        // Skip if remaining buffer can be record delimiter following the closing quote
        quoting ? quote.length + recordDelimiterMaxLength : 0
      );
      return numOfCharLeft < requiredLength;
    },
    // Central parser implementation
    parse: function(nextBuf, end, push, close) {
      const { bom, comment_no_infix, encoding, from_line, ltrim, max_record_size, raw, relax_quotes, rtrim, skip_empty_lines, to, to_line } = this.options;
      let { comment, escape, quote, record_delimiter } = this.options;
      const { bomSkipped, previousBuf, rawBuffer, escapeIsQuote } = this.state;
      let buf;
      if (previousBuf === void 0) {
        if (nextBuf === void 0) {
          close();
          return;
        } else {
          buf = nextBuf;
        }
      } else if (previousBuf !== void 0 && nextBuf === void 0) {
        buf = previousBuf;
      } else {
        buf = Buffer.concat([previousBuf, nextBuf]);
      }
      if (bomSkipped === false) {
        if (bom === false) {
          this.state.bomSkipped = true;
        } else if (buf.length < 3) {
          if (end === false) {
            this.state.previousBuf = buf;
            return;
          }
        } else {
          for (const encoding2 in boms) {
            if (boms[encoding2].compare(buf, 0, boms[encoding2].length) === 0) {
              const bomLength = boms[encoding2].length;
              this.state.bufBytesStart += bomLength;
              buf = buf.slice(bomLength);
              this.options = normalize_options({ ...this.original_options, encoding: encoding2 });
              ({ comment, escape, quote } = this.options);
              break;
            }
          }
          this.state.bomSkipped = true;
        }
      }
      const bufLen = buf.length;
      let pos;
      for (pos = 0; pos < bufLen; pos++) {
        if (this.__needMoreData(pos, bufLen, end)) {
          break;
        }
        if (this.state.wasRowDelimiter === true) {
          this.info.lines++;
          this.state.wasRowDelimiter = false;
        }
        if (to_line !== -1 && this.info.lines > to_line) {
          this.state.stop = true;
          close();
          return;
        }
        if (this.state.quoting === false && record_delimiter.length === 0) {
          const record_delimiterCount = this.__autoDiscoverRecordDelimiter(buf, pos);
          if (record_delimiterCount) {
            record_delimiter = this.options.record_delimiter;
          }
        }
        const chr = buf[pos];
        if (raw === true) {
          rawBuffer.append(chr);
        }
        if ((chr === cr2 || chr === nl2) && this.state.wasRowDelimiter === false) {
          this.state.wasRowDelimiter = true;
        }
        if (this.state.escaping === true) {
          this.state.escaping = false;
        } else {
          if (escape !== null && this.state.quoting === true && this.__isEscape(buf, pos, chr) && pos + escape.length < bufLen) {
            if (escapeIsQuote) {
              if (this.__isQuote(buf, pos + escape.length)) {
                this.state.escaping = true;
                pos += escape.length - 1;
                continue;
              }
            } else {
              this.state.escaping = true;
              pos += escape.length - 1;
              continue;
            }
          }
          if (this.state.commenting === false && this.__isQuote(buf, pos)) {
            if (this.state.quoting === true) {
              const nextChr = buf[pos + quote.length];
              const isNextChrTrimable = rtrim && this.__isCharTrimable(buf, pos + quote.length);
              const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos + quote.length, nextChr);
              const isNextChrDelimiter = this.__isDelimiter(buf, pos + quote.length, nextChr);
              const isNextChrRecordDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRecordDelimiter(buf, pos + quote.length) : this.__isRecordDelimiter(nextChr, buf, pos + quote.length);
              if (escape !== null && this.__isEscape(buf, pos, chr) && this.__isQuote(buf, pos + escape.length)) {
                pos += escape.length - 1;
              } else if (!nextChr || isNextChrDelimiter || isNextChrRecordDelimiter || isNextChrComment || isNextChrTrimable) {
                this.state.quoting = false;
                this.state.wasQuoting = true;
                pos += quote.length - 1;
                continue;
              } else if (relax_quotes === false) {
                const err = this.__error(
                  new CsvError("CSV_INVALID_CLOSING_QUOTE", [
                    "Invalid Closing Quote:",
                    `got "${String.fromCharCode(nextChr)}"`,
                    `at line ${this.info.lines}`,
                    "instead of delimiter, record delimiter, trimable character",
                    "(if activated) or comment"
                  ], this.options, this.__infoField())
                );
                if (err !== void 0)
                  return err;
              } else {
                this.state.quoting = false;
                this.state.wasQuoting = true;
                this.state.field.prepend(quote);
                pos += quote.length - 1;
              }
            } else {
              if (this.state.field.length !== 0) {
                if (relax_quotes === false) {
                  const info2 = this.__infoField();
                  const bom2 = Object.keys(boms).map((b) => boms[b].equals(this.state.field.toString()) ? b : false).filter(Boolean)[0];
                  const err = this.__error(
                    new CsvError("INVALID_OPENING_QUOTE", [
                      "Invalid Opening Quote:",
                      `a quote is found on field ${JSON.stringify(info2.column)} at line ${info2.lines}, value is ${JSON.stringify(this.state.field.toString(encoding))}`,
                      bom2 ? `(${bom2} bom)` : void 0
                    ], this.options, info2, {
                      field: this.state.field
                    })
                  );
                  if (err !== void 0)
                    return err;
                }
              } else {
                this.state.quoting = true;
                pos += quote.length - 1;
                continue;
              }
            }
          }
          if (this.state.quoting === false) {
            const recordDelimiterLength = this.__isRecordDelimiter(chr, buf, pos);
            if (recordDelimiterLength !== 0) {
              const skipCommentLine = this.state.commenting && (this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0);
              if (skipCommentLine) {
                this.info.comment_lines++;
              } else {
                if (this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1 : 0) >= from_line) {
                  this.state.enabled = true;
                  this.__resetField();
                  this.__resetRecord();
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                if (skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0) {
                  this.info.empty_lines++;
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                this.info.bytes = this.state.bufBytesStart + pos;
                const errField = this.__onField();
                if (errField !== void 0)
                  return errField;
                this.info.bytes = this.state.bufBytesStart + pos + recordDelimiterLength;
                const errRecord = this.__onRecord(push);
                if (errRecord !== void 0)
                  return errRecord;
                if (to !== -1 && this.info.records >= to) {
                  this.state.stop = true;
                  close();
                  return;
                }
              }
              this.state.commenting = false;
              pos += recordDelimiterLength - 1;
              continue;
            }
            if (this.state.commenting) {
              continue;
            }
            const commentCount = comment === null ? 0 : this.__compareBytes(comment, buf, pos, chr);
            if (commentCount !== 0 && (comment_no_infix === false || this.state.field.length === 0)) {
              this.state.commenting = true;
              continue;
            }
            const delimiterLength = this.__isDelimiter(buf, pos, chr);
            if (delimiterLength !== 0) {
              this.info.bytes = this.state.bufBytesStart + pos;
              const errField = this.__onField();
              if (errField !== void 0)
                return errField;
              pos += delimiterLength - 1;
              continue;
            }
          }
        }
        if (this.state.commenting === false) {
          if (max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size) {
            return this.__error(
              new CsvError("CSV_MAX_RECORD_SIZE", [
                "Max Record Size:",
                "record exceed the maximum number of tolerated bytes",
                `of ${max_record_size}`,
                `at line ${this.info.lines}`
              ], this.options, this.__infoField())
            );
          }
        }
        const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(buf, pos);
        const rappend = rtrim === false || this.state.wasQuoting === false;
        if (lappend === true && rappend === true) {
          this.state.field.append(chr);
        } else if (rtrim === true && !this.__isCharTrimable(buf, pos)) {
          return this.__error(
            new CsvError("CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE", [
              "Invalid Closing Quote:",
              "found non trimable byte after quote",
              `at line ${this.info.lines}`
            ], this.options, this.__infoField())
          );
        } else {
          if (lappend === false) {
            pos += this.__isCharTrimable(buf, pos) - 1;
          }
          continue;
        }
      }
      if (end === true) {
        if (this.state.quoting === true) {
          const err = this.__error(
            new CsvError("CSV_QUOTE_NOT_CLOSED", [
              "Quote Not Closed:",
              `the parsing is finished with an opening quote at line ${this.info.lines}`
            ], this.options, this.__infoField())
          );
          if (err !== void 0)
            return err;
        } else {
          if (this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0) {
            this.info.bytes = this.state.bufBytesStart + pos;
            const errField = this.__onField();
            if (errField !== void 0)
              return errField;
            const errRecord = this.__onRecord(push);
            if (errRecord !== void 0)
              return errRecord;
          } else if (this.state.wasRowDelimiter === true) {
            this.info.empty_lines++;
          } else if (this.state.commenting === true) {
            this.info.comment_lines++;
          }
        }
      } else {
        this.state.bufBytesStart += pos;
        this.state.previousBuf = buf.slice(pos);
      }
      if (this.state.wasRowDelimiter === true) {
        this.info.lines++;
        this.state.wasRowDelimiter = false;
      }
    },
    __onRecord: function(push) {
      const { columns, group_columns_by_name, encoding, info: info2, from, relax_column_count, relax_column_count_less, relax_column_count_more, raw, skip_records_with_empty_values } = this.options;
      const { enabled, record } = this.state;
      if (enabled === false) {
        return this.__resetRecord();
      }
      const recordLength = record.length;
      if (columns === true) {
        if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
          this.__resetRecord();
          return;
        }
        return this.__firstLineToColumns(record);
      }
      if (columns === false && this.info.records === 0) {
        this.state.expectedRecordLength = recordLength;
      }
      if (recordLength !== this.state.expectedRecordLength) {
        const err = columns === false ? new CsvError("CSV_RECORD_INCONSISTENT_FIELDS_LENGTH", [
          "Invalid Record Length:",
          `expect ${this.state.expectedRecordLength},`,
          `got ${recordLength} on line ${this.info.lines}`
        ], this.options, this.__infoField(), {
          record
        }) : new CsvError("CSV_RECORD_INCONSISTENT_COLUMNS", [
          "Invalid Record Length:",
          `columns length is ${columns.length},`,
          // rename columns
          `got ${recordLength} on line ${this.info.lines}`
        ], this.options, this.__infoField(), {
          record
        });
        if (relax_column_count === true || relax_column_count_less === true && recordLength < this.state.expectedRecordLength || relax_column_count_more === true && recordLength > this.state.expectedRecordLength) {
          this.info.invalid_field_length++;
          this.state.error = err;
        } else {
          const finalErr = this.__error(err);
          if (finalErr)
            return finalErr;
        }
      }
      if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
        this.__resetRecord();
        return;
      }
      if (this.state.recordHasError === true) {
        this.__resetRecord();
        this.state.recordHasError = false;
        return;
      }
      this.info.records++;
      if (from === 1 || this.info.records >= from) {
        const { objname } = this.options;
        if (columns !== false) {
          const obj = {};
          for (let i = 0, l = record.length; i < l; i++) {
            if (columns[i] === void 0 || columns[i].disabled)
              continue;
            if (group_columns_by_name === true && obj[columns[i].name] !== void 0) {
              if (Array.isArray(obj[columns[i].name])) {
                obj[columns[i].name] = obj[columns[i].name].concat(record[i]);
              } else {
                obj[columns[i].name] = [obj[columns[i].name], record[i]];
              }
            } else {
              obj[columns[i].name] = record[i];
            }
          }
          if (raw === true || info2 === true) {
            const extRecord = Object.assign(
              { record: obj },
              raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
              info2 === true ? { info: this.__infoRecord() } : {}
            );
            const err = this.__push(
              objname === void 0 ? extRecord : [obj[objname], extRecord],
              push
            );
            if (err) {
              return err;
            }
          } else {
            const err = this.__push(
              objname === void 0 ? obj : [obj[objname], obj],
              push
            );
            if (err) {
              return err;
            }
          }
        } else {
          if (raw === true || info2 === true) {
            const extRecord = Object.assign(
              { record },
              raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
              info2 === true ? { info: this.__infoRecord() } : {}
            );
            const err = this.__push(
              objname === void 0 ? extRecord : [record[objname], extRecord],
              push
            );
            if (err) {
              return err;
            }
          } else {
            const err = this.__push(
              objname === void 0 ? record : [record[objname], record],
              push
            );
            if (err) {
              return err;
            }
          }
        }
      }
      this.__resetRecord();
    },
    __firstLineToColumns: function(record) {
      const { firstLineToHeaders } = this.state;
      try {
        const headers = firstLineToHeaders === void 0 ? record : firstLineToHeaders.call(null, record);
        if (!Array.isArray(headers)) {
          return this.__error(
            new CsvError("CSV_INVALID_COLUMN_MAPPING", [
              "Invalid Column Mapping:",
              "expect an array from column function,",
              `got ${JSON.stringify(headers)}`
            ], this.options, this.__infoField(), {
              headers
            })
          );
        }
        const normalizedHeaders = normalize_columns_array(headers);
        this.state.expectedRecordLength = normalizedHeaders.length;
        this.options.columns = normalizedHeaders;
        this.__resetRecord();
        return;
      } catch (err) {
        return err;
      }
    },
    __resetRecord: function() {
      if (this.options.raw === true) {
        this.state.rawBuffer.reset();
      }
      this.state.error = void 0;
      this.state.record = [];
      this.state.record_length = 0;
    },
    __onField: function() {
      const { cast, encoding, rtrim, max_record_size } = this.options;
      const { enabled, wasQuoting } = this.state;
      if (enabled === false) {
        return this.__resetField();
      }
      let field = this.state.field.toString(encoding);
      if (rtrim === true && wasQuoting === false) {
        field = field.trimRight();
      }
      if (cast === true) {
        const [err, f] = this.__cast(field);
        if (err !== void 0)
          return err;
        field = f;
      }
      this.state.record.push(field);
      if (max_record_size !== 0 && typeof field === "string") {
        this.state.record_length += field.length;
      }
      this.__resetField();
    },
    __resetField: function() {
      this.state.field.reset();
      this.state.wasQuoting = false;
    },
    __push: function(record, push) {
      const { on_record } = this.options;
      if (on_record !== void 0) {
        const info2 = this.__infoRecord();
        try {
          record = on_record.call(null, record, info2);
        } catch (err) {
          return err;
        }
        if (record === void 0 || record === null) {
          return;
        }
      }
      push(record);
    },
    // Return a tuple with the error and the casted value
    __cast: function(field) {
      const { columns, relax_column_count } = this.options;
      const isColumns = Array.isArray(columns);
      if (isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length) {
        return [void 0, void 0];
      }
      if (this.state.castField !== null) {
        try {
          const info2 = this.__infoField();
          return [void 0, this.state.castField.call(null, field, info2)];
        } catch (err) {
          return [err];
        }
      }
      if (this.__isFloat(field)) {
        return [void 0, parseFloat(field)];
      } else if (this.options.cast_date !== false) {
        const info2 = this.__infoField();
        return [void 0, this.options.cast_date.call(null, field, info2)];
      }
      return [void 0, field];
    },
    // Helper to test if a character is a space or a line delimiter
    __isCharTrimable: function(buf, pos) {
      const isTrim = (buf2, pos2) => {
        const { timchars } = this.state;
        loop1:
          for (let i = 0; i < timchars.length; i++) {
            const timchar = timchars[i];
            for (let j = 0; j < timchar.length; j++) {
              if (timchar[j] !== buf2[pos2 + j])
                continue loop1;
            }
            return timchar.length;
          }
        return 0;
      };
      return isTrim(buf, pos);
    },
    // Keep it in case we implement the `cast_int` option
    // __isInt(value){
    //   // return Number.isInteger(parseInt(value))
    //   // return !isNaN( parseInt( obj ) );
    //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
    // }
    __isFloat: function(value) {
      return value - parseFloat(value) + 1 >= 0;
    },
    __compareBytes: function(sourceBuf, targetBuf, targetPos, firstByte) {
      if (sourceBuf[0] !== firstByte)
        return 0;
      const sourceLength = sourceBuf.length;
      for (let i = 1; i < sourceLength; i++) {
        if (sourceBuf[i] !== targetBuf[targetPos + i])
          return 0;
      }
      return sourceLength;
    },
    __isDelimiter: function(buf, pos, chr) {
      const { delimiter, ignore_last_delimiters } = this.options;
      if (ignore_last_delimiters === true && this.state.record.length === this.options.columns.length - 1) {
        return 0;
      } else if (ignore_last_delimiters !== false && typeof ignore_last_delimiters === "number" && this.state.record.length === ignore_last_delimiters - 1) {
        return 0;
      }
      loop1:
        for (let i = 0; i < delimiter.length; i++) {
          const del = delimiter[i];
          if (del[0] === chr) {
            for (let j = 1; j < del.length; j++) {
              if (del[j] !== buf[pos + j])
                continue loop1;
            }
            return del.length;
          }
        }
      return 0;
    },
    __isRecordDelimiter: function(chr, buf, pos) {
      const { record_delimiter } = this.options;
      const recordDelimiterLength = record_delimiter.length;
      loop1:
        for (let i = 0; i < recordDelimiterLength; i++) {
          const rd = record_delimiter[i];
          const rdLength = rd.length;
          if (rd[0] !== chr) {
            continue;
          }
          for (let j = 1; j < rdLength; j++) {
            if (rd[j] !== buf[pos + j]) {
              continue loop1;
            }
          }
          return rd.length;
        }
      return 0;
    },
    __isEscape: function(buf, pos, chr) {
      const { escape } = this.options;
      if (escape === null)
        return false;
      const l = escape.length;
      if (escape[0] === chr) {
        for (let i = 0; i < l; i++) {
          if (escape[i] !== buf[pos + i]) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    __isQuote: function(buf, pos) {
      const { quote } = this.options;
      if (quote === null)
        return false;
      const l = quote.length;
      for (let i = 0; i < l; i++) {
        if (quote[i] !== buf[pos + i]) {
          return false;
        }
      }
      return true;
    },
    __autoDiscoverRecordDelimiter: function(buf, pos) {
      const { encoding } = this.options;
      const rds = [
        // Important, the windows line ending must be before mac os 9
        Buffer.from("\r\n", encoding),
        Buffer.from("\n", encoding),
        Buffer.from("\r", encoding)
      ];
      loop:
        for (let i = 0; i < rds.length; i++) {
          const l = rds[i].length;
          for (let j = 0; j < l; j++) {
            if (rds[i][j] !== buf[pos + j]) {
              continue loop;
            }
          }
          this.options.record_delimiter.push(rds[i]);
          this.state.recordDelimiterMaxLength = rds[i].length;
          return rds[i].length;
        }
      return 0;
    },
    __error: function(msg) {
      const { encoding, raw, skip_records_with_error } = this.options;
      const err = typeof msg === "string" ? new Error(msg) : msg;
      if (skip_records_with_error) {
        this.state.recordHasError = true;
        if (this.options.on_skip !== void 0) {
          this.options.on_skip(err, raw ? this.state.rawBuffer.toString(encoding) : void 0);
        }
        return void 0;
      } else {
        return err;
      }
    },
    __infoDataSet: function() {
      return {
        ...this.info,
        columns: this.options.columns
      };
    },
    __infoRecord: function() {
      const { columns, raw, encoding } = this.options;
      return {
        ...this.__infoDataSet(),
        error: this.state.error,
        header: columns === true,
        index: this.state.record.length,
        raw: raw ? this.state.rawBuffer.toString(encoding) : void 0
      };
    },
    __infoField: function() {
      const { columns } = this.options;
      const isColumns = Array.isArray(columns);
      return {
        ...this.__infoRecord(),
        column: isColumns === true ? columns.length > this.state.record.length ? columns[this.state.record.length].name : null : this.state.record.length,
        quoting: this.state.wasQuoting
      };
    }
  };
};

// ../../node_modules/.pnpm/csv-parse@5.5.3/node_modules/csv-parse/lib/sync.js
var parse = function(data, opts = {}) {
  if (typeof data === "string") {
    data = Buffer.from(data);
  }
  const records = opts && opts.objname ? {} : [];
  const parser = transform(opts);
  const push = (record) => {
    if (parser.options.objname === void 0)
      records.push(record);
    else {
      records[record[0]] = record[1];
    }
  };
  const close = () => {
  };
  const err1 = parser.parse(data, false, push, close);
  if (err1 !== void 0)
    throw err1;
  const err2 = parser.parse(void 0, true, push, close);
  if (err2 !== void 0)
    throw err2;
  return records;
};

// ../../node_modules/.pnpm/thistogram@1.1.1/node_modules/thistogram/dist/drawingCharacters.js
var BoxSymbol;
(function(BoxSymbol2) {
  BoxSymbol2[BoxSymbol2["topLeft"] = 0] = "topLeft";
  BoxSymbol2[BoxSymbol2["topRight"] = 1] = "topRight";
  BoxSymbol2[BoxSymbol2["bottomRight"] = 2] = "bottomRight";
  BoxSymbol2[BoxSymbol2["bottomLeft"] = 3] = "bottomLeft";
  BoxSymbol2[BoxSymbol2["vertical"] = 4] = "vertical";
  BoxSymbol2[BoxSymbol2["horizontal"] = 5] = "horizontal";
  BoxSymbol2[BoxSymbol2["leftT"] = 6] = "leftT";
  BoxSymbol2[BoxSymbol2["rightT"] = 7] = "rightT";
  BoxSymbol2[BoxSymbol2["bottomT"] = 8] = "bottomT";
  BoxSymbol2[BoxSymbol2["topT"] = 9] = "topT";
  BoxSymbol2[BoxSymbol2["cross"] = 10] = "cross";
})(BoxSymbol || (BoxSymbol = {}));
var boxSymbols = ["\u250F", "\u2513", "\u251B", "\u2517", "\u2503", "\u2501", "\u2523", "\u252B", "\u253B", "\u2533", "\u254B"];
var histoCharsBottomToTop = ["\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];

// ../../node_modules/.pnpm/thistogram@1.1.1/node_modules/thistogram/dist/bars.js
function simpleHistogram(data, min, max, barChars = histoCharsBottomToTop) {
  const [minVal, maxVal] = minMaxRange(data, min, max);
  const range = maxVal - minVal || 1;
  const lenBarChars = barChars.length;
  const scale = lenBarChars / range;
  const scaled = data.map((v) => Math.ceil((Math.min(v, maxVal) - minVal) * scale));
  return scaled.map((v) => v > 0 ? barChars[v - 1] : " ").join("");
}
var stPlotChars = {
  left2: boxSymbols[BoxSymbol.leftT],
  left1: boxSymbols[BoxSymbol.bottomT],
  middle: boxSymbols[BoxSymbol.horizontal],
  center: boxSymbols[BoxSymbol.cross],
  right1: boxSymbols[BoxSymbol.bottomT],
  right2: boxSymbols[BoxSymbol.rightT],
  point: "\u25CF"
};
function plotPointRelativeToStandardDeviation(point, sd, mean, width, range = 2.5) {
  const plot = " ".repeat(width).split("");
  const scale = width / (2 * range * sd);
  const diff = point - mean;
  const mid = width >> 1;
  const f = (v) => Math.min(Math.max(0, Math.floor(v * scale + mid + 0.5)), width - 1);
  const leftMost = f(-2 * sd);
  const rightMost = f(2 * sd);
  for (let i = leftMost; i <= rightMost; i++) {
    plot[i] = stPlotChars.middle;
  }
  plot[mid] = stPlotChars.center;
  plot[f(-sd)] = stPlotChars.left1;
  plot[f(sd)] = stPlotChars.right1;
  plot[leftMost] = stPlotChars.left2;
  plot[rightMost] = stPlotChars.right2;
  plot[f(diff)] = stPlotChars.point;
  return plot.join("");
}
function minMaxRange(values, min, max) {
  const minVal = min ?? Math.min(...values);
  const maxVal = max ?? Math.max(...values);
  const adj = (maxVal - minVal) * 0.05;
  const r = [min ?? minVal - adj, max ?? maxVal + adj];
  return r;
}

// ../../node_modules/.pnpm/thistogram@1.1.1/node_modules/thistogram/dist/histogram.js
var valueMinMaxSymbols = [
  "\u25CF",
  boxSymbols[BoxSymbol.leftT],
  boxSymbols[BoxSymbol.horizontal],
  boxSymbols[BoxSymbol.rightT]
];

// ../../node_modules/.pnpm/thistogram@1.1.1/node_modules/thistogram/dist/stats.js
function calcStandardDeviation(values) {
  const variance = calcVariance(values);
  return Math.sqrt(variance);
}
function calcMean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
function calcVariance(values, mean) {
  const avg = mean ?? calcMean(values);
  return values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
}

// src/perfChart.ts
async function perfReport(csvFile) {
  const limit = changeDate(/* @__PURE__ */ new Date(), -30).getTime();
  const records = (await readCsvData(csvFile)).filter((r) => r.platform === "linux" && r.timestamp >= limit);
  const data = [...groupBy(records, "repo")].sort((a, b) => a[0].localeCompare(b[0]));
  const markdown = `# Performance Report

${createPerfTable1(data)}

${createPerfTable2(data)}

`;
  return markdown;
}
async function readCsvData(csvFile) {
  const csv = await import_node_fs.promises.readFile(csvFile, "utf-8");
  const records = parse(csv, { columns: true, cast: true });
  return records;
}
var emptyStats = { point: 0, min: 0, max: 0, sum: 0, count: 0, sd: 0, trend: [0] };
function calcStats(data) {
  const values = data.map((d) => d.elapsedMs).map((v) => v || 1);
  const trend = values.slice(-20);
  const point = values.pop();
  if (point === void 0)
    return emptyStats;
  if (values.length === 0)
    return { point, min: point, max: point, sum: point, count: 1, sd: 0, trend };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const sd = calcStandardDeviation(values);
  return { point, min, max, sum: values.reduce((a, b) => a + b, 0), count: values.length, sd, trend };
}
function groupBy(data, key) {
  const map = /* @__PURE__ */ new Map();
  for (const d of data) {
    const k = d[key];
    const group = map.get(k) || [];
    group.push(d);
    map.set(k, group);
  }
  return map;
}
function changeDate(date, deltaDays) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d;
}
function calcAllStats(data) {
  return data.map(([_, records]) => calcStats(records));
}
function p(s2, n) {
  return n < 0 ? s2.padEnd(-n, " ") : s2.padStart(n, " ");
}
var s = (v, fixed = 3) => (v / 1e3).toFixed(fixed);
function createPerfTable1(data) {
  const sp = (v, pad = 5, fixed = 1) => p(s(v, fixed), pad);
  const stats = calcAllStats(data);
  const maxRelSd = Math.max(...stats.map((s2) => s2.sd * s2.sum / s2.count));
  const rows = data.map(([repo], i) => {
    const { point, min, max, sum, count, sd } = stats[i];
    const avg = sum / (count || 1);
    const relSd = sd * sum / count;
    const sdGraph = sd ? plotPointRelativeToStandardDeviation(
      point,
      sd,
      avg,
      21,
      Math.max(2.5 + Math.log(maxRelSd / relSd) / 6, Math.abs(point - avg) / sd)
    ) : "";
    return `| ${repo.padEnd(36)} | ${p(s(point, 2), 6)} | ${sp(min)} / ${sp(avg)} / ${sp(max)} | ${sp(sd, 5, 2)} | \`${sdGraph}\` |`;
  });
  return `
| Repository | Elapsed | Min/Avg/Max | SD  | SD Graph  |
| ---------- | ------: | ----------- | --: | --------  |
${rows.join("\n")}
`;
}
function createPerfTable2(data) {
  const stats = calcAllStats(data);
  const rows = data.map(([repo], i) => {
    const { point, sum, count, trend } = stats[i];
    const avg = sum / (count || 1);
    const trendGraph = simpleHistogram(trend);
    const relChange = (100 * (point - avg) / (avg || 1)).toFixed(2) + "%";
    return `| ${repo.padEnd(36)} | ${p(s(point, 2), 6)} | ${p(relChange, 6)} | \`${trendGraph}\` | ${count} |`;
  });
  return `
| Repository | Elapsed | Rel   | Trend | Count |
| ---------- | ------: | ----: | ----- | ----: |
${rows.join("\n")}

Note:
- Elapsed time is in seconds. The trend graph shows the last 10 runs.
  The SD graph shows the current run relative to the average and standard deviation.
- Rel is the relative change from the average.
`;
}

// src/app.ts
program.argument("<file>", "path to perf data file").description("Generate a min/max chart of the perf data").action(async (file) => {
  const chart = await perfReport(file);
  console.log(chart);
}).parseAsync();
