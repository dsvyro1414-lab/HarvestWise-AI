# U.S. Midwest Baseline

HarvestWise now ships with an editable field-crop baseline for corn, soybeans, and wheat. It uses USD, acres, and bushels and is intended to make the first plan understandable to a U.S. audience.

## What the defaults mean

The catalog is a **Central Illinois / Midwest reference model**, not a local quote feed. It includes seed, fertilizer, fieldwork and equipment, land lease, hauling, yield, and an expected market price. Land lease is included explicitly so the plan does not imply that access to the field is free.

The figures are simplified, editable screening assumptions for a 40-acre planning example. They are not a complete enterprise budget and should not be described as conservative. A farmer must replace them with their lease, input quotes, yield history, buyer price, and missing cost categories before treating the plan as a commitment.

## Calibration sources

- [USDA ERS Commodity Costs and Returns](https://www.ers.usda.gov/data-products/commodity-costs-and-returns) provides regional and national cost-and-return estimates for corn, soybeans, and wheat.
- [University of Illinois 2025 crop budgets](https://farmdocdaily.illinois.edu/2024/09/2025-illinois-crop-budgets.html) provides regional corn, soybean, and wheat budget context for Illinois.
- [Illinois Extension 2026 outlook](https://extension.illinois.edu/blogs/farm-focus/2026-01-23-farm-economic-outlook-central-illinois-2026) provides recent Central Illinois yield and profitability context.

The values in `src/domain/crops.ts` simplify these sources into the small deterministic model used by HarvestWise. They are not a copy of a full enterprise budget and do not model insurance, debt service, property tax, or every machinery/overhead category.

## External benchmark — directional, not like-for-like

The prepared Corn demo can be compared with the [University of Illinois Extension 2026 Central Illinois outlook](https://extension.illinois.edu/blogs/farm-focus/2026-01-23-farm-economic-outlook-central-illinois-2026). This is a credibility check on scope, not a claim that HarvestWise reproduces or validates against the Illinois enterprise budget.

| Metric | HarvestWise prepared demo | Illinois Extension 2026, high-productivity Central Illinois |
| --- | ---: | ---: |
| Corn yield | 220 bu/acre | 241 bu/acre |
| Corn price | $4.05/bu | $4.25/bu |
| Modeled or total cost | $830/acre | $1,135/acre |
| Expected return | +$61/acre | -$55/acre |
| Break-even | $3.77/bu | $4.71/bu |

The Illinois estimate combines $808/acre of non-land costs with $327/acre of land cost and includes an estimated $56/acre ARC/PLC payment in gross revenue. HarvestWise includes only the categories visible in the app: seed, fertilizer, fieldwork/equipment, land lease, hauling, and optional storage. It excludes insurance, debt service, taxes, complete machinery and overhead costs, and government payments.

The useful conclusion is therefore not that HarvestWise is more profitable. It is that the app's `$3.77/bu` value is an **entered-cost break-even** for a partial planning model. The external budget shows why a farmer must add locally relevant missing costs before treating the plan as a full economic commitment.

## Market price evidence

The current UI does not fetch or apply a remote cash bid. The market price is a farmer-entered planning assumption, and HarvestWise never presents it as live market data.

Farmers can record the source type, buyer or contact, market location, and confirmation date next to that price. HarvestWise labels the evidence as fresh, aging, stale, or unverified for follow-up, but the evidence never changes finance or the deterministic recommended action. Before relying on the plan, confirm the entered price with a local buyer, co-op, or grain elevator.
