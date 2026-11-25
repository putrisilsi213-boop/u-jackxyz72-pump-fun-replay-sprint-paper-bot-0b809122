// Dip-buying mean-reversion bot for make.fun's Pump.fun Replay Sprint.
// Run by the grader as `node /bot/main.ts`; the SDK shim is vendored in vendor/.

import { runBot } from './vendor/makefun-bot.ts';
import { createDipBot, DEFAULT_PARAMS } from './strategy.ts';

await runBot({ onBatch: createDipBot(DEFAULT_PARAMS) });
