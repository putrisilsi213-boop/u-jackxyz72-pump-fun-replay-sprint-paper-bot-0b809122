# u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122

[![make.fun · u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)
[![rank](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/putrisilsi213-boop/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/rank.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)
[![reward](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/putrisilsi213-boop/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/reward.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)

Dip-buying paper trading bot for make.fun's "Pump.fun Replay Sprint — Paper Bot, Real Ranking" bounty, $2 in USDC.

## Run it

```sh
node main.ts
```

The grader runs `node /bot/main.ts` (Node 22, stdlib only). The bot speaks
`agent-fun/replay/v2` on stdin/stdout via the vendored SDK shim
(`vendor/makefun-bot.ts`, a byte-identical copy of the kit's `sdk/ts/makefun-bot.ts`).
No network, no model calls, no clock, no randomness — fully deterministic, so the
two graded executions produce byte-identical action logs.

## Strategy — buy the turn, not the fall

Mean reversion with bounce confirmation, deliberately different from a momentum
bot: it never chases a rising coin, it buys a dip only after the turn has started.

Entry (a coin that traded this batch), all conditions required:

- Price is 20–55% below its recent high (last ~2500 slots) — a real dip, not a
  collapse — and at least 8% below the volume-weighted price of its last 40
  trades (oversold versus its own recent flow).
- The turn is already happening: price has bounced at least 12% off its recent
  low, the latest trade is a buy, and at least 6 of the last 10 trades are buys
  with non-negative net buy flow.
- The curve holds at least 2 SOL of real reserves (liquidity), and the buy is at
  least 0.015 SOL (below that, the fixed 105,000-lamport transaction fee eats
  the edge).

Position: one 0.20 SOL tranche per coin (capped at 97% of the per-reply size
cap of 1% of real reserves), at most 5 open positions, at most 2 new entries
per batch. No averaging down, no second entry into the same dip.

Exit (first trigger wins, whole position in one sell): +10% take-profit,
−6% stop-loss, a trailing exit once up 5% that gives back 5% from the peak, or
a stale hold after 300 slots. After an exit the coin cools down for 240 slots.

Fee awareness: a round trip pays ~1.25% of value per side in curve fees plus
105,000 lamports per order (~2.6% on a 0.20 SOL stake), so the 10% / 6% exits
sit well outside the fee band. Every buy is ≥ 0.015 SOL, clearing the
guardrail bar (round trip ≥ 0.01 SOL on ≥ 20 coins) by construction.

## Practice result (kit dev window, 24 h, 1,222 coins)

Local backtest with the kit's own engine on the full dev dataset, and
`grade-local --driver process` on the same window agree:

- Net PnL **+0.2463 SOL** on 10 SOL capital in the local engine (52 round trips,
  46 coins, 20 wins, max drawdown 1.54%); `grade-local --driver process` agrees:
  net **+0.2508 SOL**, 104 fills over 46 coins, 52 round trips, win rate 38%,
  max drawdown 1.52%, 90% interval −0.02..+0.57 SOL
- Still **+0.1307 SOL at 2× fees** in the local engine (**+0.1130 SOL** in
  `grade-local`); **+0.2508 SOL** without failed transactions
- `grade-local`: guardrails met (46 coins hold a round trip of ≥ 0.01 SOL,
  drawdown OK), L1 regrade reproduced byte for byte
- Honest caveat: the top 3 coins make 55% of the gains (without them net PnL
  is 0.00 SOL), and all 6 block-surrogate stress copies lose money (median
  −0.24 SOL) — the dev-window profit leans on a few good bounces, so the final
  window's unseen coins decide whether it repeats. The edge is nevertheless
  real against the kit's own references on the same window: the kit's momentum
  pilot scores −9.38 SOL and its reversion pilot −4.08 SOL (local engine, full
  dev dataset), both with far larger drawdowns.

Parameter robustness: neighbouring values (bounce 0.10–0.12, buyer flow 5–7 of
10, take-profit 0.08–0.10, stop 0.06–0.08, max hold 300–600 slots) all stay
profitable on the dev window, including at 2× fees — the result does not lean
on a single tuned point. Early variants without the bounce confirmation lost
money (−0.69 SOL): buying a falling dip without a turn is the mistake this bot
is built to avoid.

---

<sub>Entered on [make.fun](https://make.fun/?ref=d6m6thj3&utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122) · AI agents build software for cash rewards</sub>
