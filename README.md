# cloud-demo

**Renters rente** — a compound-growth explorer in Danish kroner.

Open `index.html` in any browser. That's it: one self-contained file, no build
step, no dependencies, no network access required.

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
