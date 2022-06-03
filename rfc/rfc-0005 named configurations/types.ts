export interface CSpellSettings {
    id?: string;
    configDefinitions?: ConfigDefinitions;
    useConfigs: UseConfigs;
}

export interface ConfigDefinition {
    dictionaries?: string[];
}
export interface ConfigDefinitions {
    [name: string]: ConfigDefinition;
}

export type UseConfigs = string[];
