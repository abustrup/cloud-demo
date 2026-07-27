/* Opens the page in a real browser and asks the only question that matters:
   does this still work?

   Deliberately checks BEHAVIOUR, not code — it re-does the compound-growth maths
   independently and demands the page agree. If someone breaks the formula, this fails,
   even if the code still looks fine. */
import { chromium } from 'playwright';

const url = new URL('../index.html', import.meta.url).href;
const failures = [];

/* Independent maths. Never import the page's own version — that would only prove
   the page agrees with itself. */
function expected(start, monthly, rate, years) {
  const monthlyRate = Math.pow(1 + rate / 100, 1 / 12) - 1;
  const months = Math.round(years * 12);
  let value = start, contributed = start;
  for (let m = 1; m <= months; m++) {
    value = value * (1 + monthlyRate) + monthly;
    contributed += monthly;
  }
  return { value, contributed };
}

/* "2.620.497 kr." -> 2620497   (da-DK: "." groups, "," decimates) */
const parseKr = t =>
  parseFloat(String(t).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.'));

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('pageerror', e => failures.push('Uncaught JavaScript error: ' + e.message));
page.on('console', m => { if (m.type() === 'error') failures.push('Console error: ' + m.text()); });

await page.goto(url);
await page.waitForSelector('.card.scn', { timeout: 10000 });

/* 1. Both scenarios render */
const cardCount = await page.locator('.card.scn').count();
if (cardCount !== 2) failures.push(`Expected 2 scenario cards, found ${cardCount}.`);

/* 2. The numbers on screen are actually correct */
for (const key of ['a', 'b']) {
  const card = page.locator('.card.scn').filter({ has: page.locator(`#start-${key}`) });
  if (await card.count() === 0) { failures.push(`Scenario "${key}" is missing.`); continue; }

  const read = async f => parseFloat(await page.inputValue(`#${f}-${key}`));
  const inputs = {
    start: await read('start'), monthly: await read('monthly'),
    rate: await read('rate'), years: await read('years'),
  };
  const want = expected(inputs.start, inputs.monthly, inputs.rate, inputs.years);

  const gotTotal = parseKr(await card.locator('.total').innerText());
  const gotContrib = parseKr(await card.locator('.c-vl').innerText());

  if (Math.abs(gotTotal - want.value) > 1.5) {
    failures.push(
      `Scenario "${key}" total is wrong: page says ${gotTotal}, maths says ${Math.round(want.value)} ` +
      `(start ${inputs.start}, ${inputs.monthly}/md, ${inputs.rate}%, ${inputs.years} yr).`);
  }
  if (Math.abs(gotContrib - want.contributed) > 1.5) {
    failures.push(
      `Scenario "${key}" contributed total is wrong: page says ${gotContrib}, maths says ${want.contributed}.`);
  }
}

/* 3. The chart actually drew something */
const drawn = await page.locator('#chart path, #chart polyline, #chart rect').count();
if (drawn < 1) failures.push('The chart rendered no shapes — it is empty.');

/* 4. It is live, not a screenshot: moving a slider must move the result */
const cardA = page.locator('.card.scn').filter({ has: page.locator('#start-a') });
const before = parseKr(await cardA.locator('.total').innerText());
const monthlyNow = parseFloat(await page.inputValue('#monthly-a'));
await page.locator('#monthly-a').fill(String(monthlyNow + 1000));
await page.waitForTimeout(150);
const after = parseKr(await cardA.locator('.total').innerText());
if (!(after > before)) {
  failures.push(`Sliders do not update the result (${before} -> ${after}) — the page is not interactive.`);
}

await browser.close();

if (failures.length) {
  console.error('FAIL: the page does not work.\n');
  failures.forEach(f => console.error('  - ' + f));
  process.exit(1);
}
console.log('PASS: page loads clean, both scenarios compute correctly, chart draws, sliders respond.');
