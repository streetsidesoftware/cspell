/* eslint-disable @typescript-eslint/no-explicit-any */

const data: Record<string, any> = {};

export function setData(value: any): void;
export function setData(key: string, value: any): void;
export function setData(keyValue: string | any, value?: any): void {
    if (typeof keyValue == 'string') {
        data[keyValue] = value;
        return;
    }
    Object.assign(data, keyValue);
}

export const mockSetData = jest.fn(setData);

export const mockAll = jest.fn(() => data);

export function clearData(): void {
    for (const key of Object.keys(data)) {
        delete data[key];
    }
}

export const mockClearData = jest.fn(clearData);

export function clearMocks() {
    mockAll.mockClear();
    mockSetData.mockClear();
    mockClearData.mockClear();
    clearData();
}

export function getConfigstoreLocation(id?: string) {
    id = id || 'cspell';
    return `/User/local/data/.config/configstore/${id}.json`;
}

const mock = jest.fn().mockImplementation((id: string) => {
    const r = {
        path: getConfigstoreLocation(id),
        set: mockSetData,
        size: 0,
        clear: mockClearData,
    };
    Object.defineProperty(r, 'all', {
        get: mockAll,
        set: (v) => {
            clearData();
            setData(v);
        },
    });
    return r;
});

export default mock;
