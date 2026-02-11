export type DisposableEx = LegacyDisposable & Disposable;

export interface LegacyDisposable {
    dispose(): void;
}
