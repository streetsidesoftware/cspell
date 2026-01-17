import { cpus } from 'node:os';

import type { CSpellWorker } from './cspellWorker.js';
import { startCSpellWorker } from './cspellWorker.js';

export interface CSpellWorkerPoolOptions {
    /**
     * The maximum number of workers to create in the pool.
     */
    maxWorkers?: number;
    /**
     * The minimum number of workers to create in the pool.
     */
    minWorkers?: number;
    /**
     *
     */
    maxPendingTasksPerWorker?: number;
}

const MAX_WORKERS_TO_CORES_RATIO = 0.75;
const DEFAULT_WORKERS_TO_CORES_RATIO = 0.5;

export interface GetAvailableWorkerOptions {
    /**
     * If true, only return ready workers.
     */
    onlyReady?: boolean;

    /**
     * If true, only return workers that do not have pending requests.
     */
    onlyIdle?: boolean;

    /**
     * If true, start a new worker if no available worker is found.
     */
    autostart?: boolean;
}

export class CSpellWorkerPool {
    #workers: Set<CSpellWorker>;
    #options: CSpellWorkerPoolOptions;
    #maxWorkers: number;
    #minWorkers: number;
    #maxPendingTasksPerWorker: number;

    constructor(options?: CSpellWorkerPoolOptions) {
        this.#workers = new Set<CSpellWorker>();
        this.#options = options || {};

        this.#maxPendingTasksPerWorker = this.#options.maxPendingTasksPerWorker ?? 1;
        this.#maxPendingTasksPerWorker = Math.max(1, this.#maxPendingTasksPerWorker);

        const numCores = cpus().length;

        this.#maxWorkers = this.#options.maxWorkers ?? Math.ceil(numCores * DEFAULT_WORKERS_TO_CORES_RATIO);
        this.#maxWorkers = Math.min(this.#maxWorkers, Math.ceil(numCores * MAX_WORKERS_TO_CORES_RATIO));
        this.#maxWorkers = Math.max(1, this.#maxWorkers);
        this.#minWorkers = Math.min(this.#options.minWorkers ?? 0, this.#maxWorkers);

        for (let i = 0; i < this.#minWorkers; i++) {
            this.#createWorker();
        }
    }

    #createWorker(): CSpellWorker {
        const w = startCSpellWorker();
        this.#workers.add(w);
        return w;
    }

    get size(): number {
        return this.#workers.size;
    }

    get maxWorkers(): number {
        return this.#maxWorkers;
    }

    get minWorkers(): number {
        return this.#minWorkers;
    }

    get maxPendingTasksPerWorker(): number {
        return this.#maxPendingTasksPerWorker;
    }

    set maxPendingTasksPerWorker(value: number) {
        this.#maxPendingTasksPerWorker = Math.max(1, value);
    }

    getAvailableWorker(options?: GetAvailableWorkerOptions): CSpellWorker | undefined {
        let workers = [...this.#workers];
        workers = workers.filter((worker) => worker.numberOfPendingRequests < this.#maxPendingTasksPerWorker);
        workers = options?.onlyReady ? workers.filter((worker) => worker.isReadyNow) : workers;
        workers = options?.onlyIdle ? workers.filter((worker) => worker.numberOfPendingRequests === 0) : workers;

        workers.sort((a, b) => {
            let v: number = 0;
            v = (a.isReadyNow ? 0 : 1) - (b.isReadyNow ? 0 : 1);
            if (v !== 0) return v;
            v = a.numberOfPendingRequests - b.numberOfPendingRequests;
            return v;
        });

        if (workers.length > 0) {
            return workers[0];
        }

        if (options?.autostart && this.#workers.size < this.#maxWorkers) {
            return this.#createWorker();
        }

        return undefined;
    }

    stopWorker(worker: CSpellWorker): Promise<void> {
        this.#workers.delete(worker);
        return worker[Symbol.asyncDispose]();
    }

    [Symbol.asyncDispose](): Promise<void> {
        const workers = [...this.#workers];
        this.#workers.clear();
        return Promise.all(workers.map((w) => this.stopWorker(w).catch(() => undefined))).then(() => undefined);
    }
}
