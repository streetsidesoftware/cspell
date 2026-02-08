import type { FSCapabilities } from './VFileSystem.js';
import { FSCapabilityFlags } from './VFileSystem.js';

export class CFsCapabilities {
    constructor(readonly flags: FSCapabilityFlags) {}

    get readFile(): boolean {
        return !!(this.flags & FSCapabilityFlags.Read);
    }

    get writeFile(): boolean {
        return !!(this.flags & FSCapabilityFlags.Write);
    }

    get readDirectory(): boolean {
        return !!(this.flags & FSCapabilityFlags.ReadDir);
    }

    get writeDirectory(): boolean {
        return !!(this.flags & FSCapabilityFlags.WriteDir);
    }

    get stat(): boolean {
        return !!(this.flags & FSCapabilityFlags.Stat);
    }
}

export function fsCapabilities(flags: FSCapabilityFlags): FSCapabilities {
    return new CFsCapabilities(flags);
}
