import { describe, expect, test } from 'vitest';

// Must use the dist version to test workers.
import { CSpellWorkerPool } from '../dist/index.js';

describe('CSpellWorkerPool', () => {
    test('create CSpellWorkerPool', async () => {
        await using pool = new CSpellWorkerPool({ maxWorkers: 2, minWorkers: 0 });
        expect(pool).toBeDefined();
        expect(pool.maxWorkers).toBe(2);
        expect(pool.minWorkers).toBe(0);
        expect(pool.size).toBe(0);
        expect(pool.maxPendingTasksPerWorker).toBe(1);
    });

    test('create CSpellWorkerPool 0 max workers', async () => {
        await using pool = new CSpellWorkerPool({ maxWorkers: 0, minWorkers: 5 });
        expect(pool.maxWorkers).toBe(1);
        expect(pool.minWorkers).toBe(1);
        expect(pool.size).toBe(1);
        expect(pool.maxPendingTasksPerWorker).toBe(1);
    });

    test('getAvailableWorker', async () => {
        await using pool = new CSpellWorkerPool({ maxWorkers: 2, minWorkers: 0 });
        expect(pool.getAvailableWorker()).toBeUndefined();

        const worker1 = pool.getAvailableWorker({ autostart: true });
        expect(worker1).toBeDefined();

        // Requesting again should return the same worker.
        const worker1a = pool.getAvailableWorker({ autostart: true });
        expect(worker1a).toBe(worker1);
        expect(pool.size).toBe(1);

        // We should be able to get another worker.
        const worker2 = pool.getAvailableWorker({ autostart: true, onlyReady: true });
        expect(worker2).toBeDefined();
        expect(pool.size).toBe(2);

        // Cannot get a third worker.
        const worker3 = pool.getAvailableWorker({ autostart: true, onlyReady: true });
        expect(worker3).toBeUndefined();
        expect(pool.size).toBe(2);
    });

    test('getAvailableWorker only ready', async () => {
        await using pool = new CSpellWorkerPool({ maxWorkers: 2, minWorkers: 0 });
        expect(pool.getAvailableWorker()).toBeUndefined();

        const worker1 = pool.getAvailableWorker({ autostart: true });
        expect(worker1).toBeDefined();
        await worker1?.ready;

        // Requesting again should return the same worker.
        const worker1a = pool.getAvailableWorker({ onlyReady: true });
        expect(worker1a).toBe(worker1);
        expect(pool.size).toBe(1);
    });

    test('getAvailableWorker only ready with busy.', async () => {
        await using pool = new CSpellWorkerPool({ maxWorkers: 2, minWorkers: 0 });
        expect(pool.getAvailableWorker()).toBeUndefined();

        const worker1 = pool.getAvailableWorker({ autostart: true });
        expect(worker1).toBeDefined();
        await worker1?.ready;
        ignoreErrors(worker1?.client.getApi().sleep(500));

        // Requesting again will not return the same worker since it is busy.
        const worker1a = pool.getAvailableWorker({ onlyReady: true });
        expect(worker1a).toBe(undefined);
        expect(pool.size).toBe(1);

        pool.maxPendingTasksPerWorker = 2;
        const worker1b = pool.getAvailableWorker({ onlyReady: true });
        expect(worker1b).toBe(worker1);
        expect(pool.size).toBe(1);

        await expect(worker1b?.api().echo('test')).resolves.toBe('test');
    });
});

function ignoreErrors<T>(p: Promise<T>): Promise<T | undefined>;
function ignoreErrors<T>(p: Promise<T> | undefined): Promise<T | undefined> | undefined;
function ignoreErrors<T>(p: Promise<T> | undefined): Promise<T | undefined> | undefined {
    return p?.catch(() => undefined);
}
