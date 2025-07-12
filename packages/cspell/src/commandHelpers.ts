import { Option as CommanderOption } from 'commander';

/**
 * Collects string values into an array.
 * @param value the new value(s) to collect.
 * @param previous the previous values.
 * @returns the new values appended to the previous values.
 */
export function collect(value: string | string[], previous: string[] | undefined): string[] {
    const values = Array.isArray(value) ? value : [value];
    return previous ? [...previous, ...values] : values;
}

/**
 * Create Option - a helper function to create a commander option.
 * @param name - the name of the option
 * @param description - the description of the option
 * @param parseArg - optional function to parse the argument
 * @param defaultValue - optional default value
 * @returns CommanderOption
 */
export function crOpt<T>(
    name: string,
    description: string,
    parseArg?: (value: string, previous: T) => T,
    defaultValue?: T,
): CommanderOption {
    const option = new CommanderOption(name, description);
    if (parseArg) {
        option.argParser(parseArg);
    }
    if (defaultValue !== undefined) {
        option.default(defaultValue);
    }
    return option;
}
