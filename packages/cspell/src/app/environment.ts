export interface CSpellEnvironmentVariables {
    /**
     * Enable logging ALL dictionary requests.
     * Acceptable values are: 'true', 'false', 't', 'f', 'on', 'off', 'yes', 'no', '1', '0'
     */
    CSPELL_ENABLE_DICTIONARY_LOGGING?: string;
    /**
     * The path to the dictionary log file.
     */
    CSPELL_ENABLE_DICTIONARY_LOG_FILE?: string;
    /**
     * A Csv list of fields to log.
     * Fields:
     * - time: the time the check was made in milliseconds
     * - word: the word being checked
     * - value: the result of the check
     */
    CSPELL_ENABLE_DICTIONARY_LOG_FIELDS?: string;
    CSPELL_GLOB_ROOT?: string;
}

export type EnvironmentKeys = keyof CSpellEnvironmentVariables;

type EnvironmentKeyNames = {
    [K in EnvironmentKeys]: K;
};

export const environmentKeys: EnvironmentKeyNames = {
    CSPELL_ENABLE_DICTIONARY_LOGGING: 'CSPELL_ENABLE_DICTIONARY_LOGGING',
    CSPELL_ENABLE_DICTIONARY_LOG_FILE: 'CSPELL_ENABLE_DICTIONARY_LOG_FILE',
    CSPELL_ENABLE_DICTIONARY_LOG_FIELDS: 'CSPELL_ENABLE_DICTIONARY_LOG_FIELDS',
    CSPELL_GLOB_ROOT: 'CSPELL_GLOB_ROOT',
};

export function getEnvironmentVariables(): CSpellEnvironmentVariables {
    return process.env as CSpellEnvironmentVariables;
}

export function setEnvironmentVariable<K extends EnvironmentKeys>(key: K, value: CSpellEnvironmentVariables[K]): void {
    process.env[key] = value;
}

export function getEnvironmentVariable<K extends EnvironmentKeys>(key: K): CSpellEnvironmentVariables[K] | undefined {
    return process.env[key];
}

export function truthy(value: string | undefined): boolean {
    switch (value?.toLowerCase().trim()) {
        case 't':
        case 'true':
        case 'on':
        case 'yes':
        case '1': {
            return true;
        }
    }
    return false;
}
