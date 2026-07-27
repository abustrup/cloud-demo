# cloud-demo

A sandbox for learning Claude Code **cloud environments** — sessions that run on
Anthropic's servers instead of Alexander's Mac. Created 2026-07-27. Nothing here is
load-bearing; safe to delete.

**Renters rente** — a compound-growth explorer in Danish kroner, built from an empty repo
by a cloud session.

Open `index.html` in any browser. That's it: one self-contained file, no build step, no
dependencies, no network access required.

## What it does

- Four sliders per scenario: starting amount, monthly contribution, expected
  annual return, and number of years.
- A chart of portfolio value over time that redraws live as you drag.
- A clear split of total contributed vs. total growth, as a bar and as numbers.
- A compare mode that puts two scenarios side by side, on the same chart, with
  the kroner difference between them spelled out.

## Assumptions

Contributions land at the end of each month, and the annual return is applied
as a smooth monthly rate (`(1 + r)^(1/12) - 1`). Tax, fees, and inflation are
not modelled — it's an arithmetic sandbox, not financial advice.

## The gate

Every pull request has to answer one question before it can land: **does the page still
work?** Not "is the code good" — does it actually run. Two checks, both in `tests/`:

| Check | What it would catch |
| --- | --- |
| `selfcontained.mjs` | Someone adds a CDN link, so the page stops working offline |
| `check.mjs` | The page throws an error, the chart draws nothing, the sliders stop responding, or **the compound-growth maths returns the wrong number** |

The second one is the interesting one. It opens the page in a real browser, reads the
slider values, redoes the compound-growth calculation *independently*, and demands the
page agree to within one krone. If someone breaks the formula it fails — even if the code
still looks perfectly reasonable.

Both were verified against deliberate breakage on 2026-07-27: corrupting the formula and
adding a CDN link each produced a clear failure with a plain-English message.

## Why this exists

Without a check, "auto-merge when ready" means "merge immediately" — there is nothing to
be ready for. With it, a pull request waits for evidence, Claude's Auto-fix can repair a
failure on its own, and green work lands without anyone reading a diff.

## Run it yourself

```sh
npm install
npx playwright install chromium
npm run check
```
