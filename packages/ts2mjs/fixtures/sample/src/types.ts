export type PrimeNumber = number;
export type Tuple<T, U> = [T, U];

export type GUID = string;

export type AddressGuid = GUID;

export interface Address {
    guid: AddressGuid;
    name: string;
    type: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
    provence?: string;
    annotations?: Annotation[];
}

export type PhonenumberGuid = GUID;

export interface Phonenumber {
    guid: PhonenumberGuid;
    name: string;
    type: string;
    number: string;
    annotations?: Annotation[];
}

export type PersonGuid = GUID;

export interface Person {
    guid: PersonGuid;
    name: string;
    aliases?: string[];
    dob?: string;
    addresses?: Address[];
    notes?: Annotation[];
}

export interface Annotation {
    note: string;
    type: string;
    madeBy: PersonGuid;
}
