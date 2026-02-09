import type { UnpluginInstance } from 'unplugin';

import type { Options } from './core/index.ts';
import { createPlugin } from './core/index.ts';

export const InlineCSpellConfig: UnpluginInstance<Options | undefined, false> = createPlugin();
