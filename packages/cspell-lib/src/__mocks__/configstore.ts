/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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

const mock = jest.fn().mockImplementation(() => {
    const r = {
        path: '/User/local/data/config/configstore',
        all: data,
        set: mockSetData,
        size: 0,
        clear: mockClearData,
    };
    Object.defineProperty(r, 'all', { get: mockAll });
    return r;
});

export default mock;
