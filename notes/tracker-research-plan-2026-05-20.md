# Octopus Tracker research and implementation plan

Date: 2026-05-20

## Research summary (Octopus updates)

1. **Tracker formulas now include a newer post-budget version from 1 April 2026**
   - The Tracker FAQ now shows a new formula set for customers who joined/renewed on or after **1 April 2026, 00:00 BST**.
   - It also states if customers signed up before 1 April 2026, Octopus applies an automatic reduction of **3.5 p/kWh (electricity)** and **0.33 p/kWh (gas)** to reflect the November 2025 Budget changes.

2. **Formula cadence and revision policy is now explicit**
   - Octopus says Tracker formula + standing charge are reviewed every 3 months (aligned with price cap updates).
   - Tracker remains a 12‑month fixed-term tariff product with daily unit-rate variation and no exit fee.

3. **Current tracker calculator in this repo is stale**
   - The website currently offers tariff codes up to **SILVER-25-09-02**, and README states that as latest.
   - Based on current FAQ content, this should be updated to include 2026-era formula support logic (even if product code naming differs from prior SILVER cadence).

## Proposed implementation plan for this site

### Phase 1 — correctness and tariff support

1. Add a new tariff option for the post-2026 formula era in the UI (with effective date metadata).
2. Refactor formula handling so tariff versions are data-driven per region (not hardcoded blocks scattered across logic).
3. Add budget-adjustment support flag for pre-2026 customers (optional toggle with help text).
4. Display "formula effective from" and "source basis" in UI for transparency.

### Phase 2 — validation and resilience

1. Add a script (or in-app test mode) to validate each region formula against known Octopus examples.
2. Add fallback messaging when tomorrow pricing is unavailable by cutoff time.
3. Add stale-data warning if API fetch date/time does not match selected day expectations.

### Phase 3 — UX enhancements

1. Add **bill estimator**: monthly cost estimate from annual kWh + standing charge.
2. Add **comparison mode**: tracker vs configurable flat unit rate (proxy for fixed/flexible tariff).
3. Add **volatility panel**: 7/30 day min, max, mean, and standard deviation.
4. Add **best-use windows** summary (cheapest upcoming periods for energy-shifting users).

## Extra feature ideas (high-value)

- Shareable deep links that include: region, tariff version, date, consumption assumptions.
- Export CSV for selected date range (gas/electricity unit rates + modeled cost).
- "What changed?" changelog drawer that lists formula-version updates over time.
- Optional push style alerts (via email/webhook script): tomorrow rises above user threshold.
- Accessibility pass: colorblind scheme defaults, keyboard-only settings panel navigation, aria-live updates for price changes.

## Suggested delivery order

1. Data-model refactor for tariff versions.
2. Add 2026 formula support + UI surfacing.
3. Introduce estimator/comparison modules.
4. Add changelog + export + alerts.
5. Accessibility and polish.

## Notes for maintainers

- Keep `README.md` tariff list in sync with UI and implemented formulas.
- Consider moving tariff definitions into a single JSON file (`data/tariffs.json`) to simplify future updates.
