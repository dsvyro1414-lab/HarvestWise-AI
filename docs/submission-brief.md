# HarvestWise AI — Hackathon Submission Write-up

## One-line pitch

HarvestWise AI helps an independent grain farmer test whether a season plan is financially workable before money is committed: Gemma understands the farmer's language, while deterministic code calculates every dollar and the recommended action.

## The problem

Planting decisions combine yield expectations, buyer price, fertilizer, seed, fieldwork, land access, hauling, and available cash. A farmer can understand the field and still commit to a season without seeing the break-even price or how quickly a cost shock removes the margin.

Generic chatbots are not a safe answer. A language model can explain a plan, but it should not silently invent financial outputs or choose a high-stakes action.

## Who it is for

The current demo is designed for an independent U.S. Midwest grain farmer and for cooperative or extension advisors helping that farmer review a plan. It is a hackathon prototype for a future field pilot, not a production farm-management or lending system.

## The solution

HarvestWise turns a few editable assumptions into one auditable decision flow:

1. **Plan** — choose Corn, Soybeans, or Wheat and enter land, available budget, expected yield, and market price. Optional price evidence records the buyer, co-op, or elevator behind the entered price.
2. **Results** — deterministic TypeScript calculates revenue, entered costs, expected profit, entered-cost break-even, cash position, risk context, and one recommended next action.
3. **Stress test** — Gemma converts a natural-language what-if into typed parameter operations; HarvestWise applies them to the unchanged baseline and recalculates locally.
4. **Reality check** — the app identifies buyer price, lease, input quotes, yield history, and timing assumptions that still need local verification.
5. **Decision Pack** — the current action, limits, evidence, local checks, and latest scenario become a concise artifact that can be copied or printed.
6. **Ask Gemma** — the model can explain already-calculated results and prepare sharing language. It cannot calculate or replace the action.

## Verified production demo path

The prepared production story uses a 40-acre Corn plan:

- available budget: `$35,000`;
- expected yield: `220 bu/acre`;
- entered market price: `$4.05/bu`;
- modeled season cost: `$33,200`;
- expected revenue: `$35,640`;
- recommended action: **Plant this plan**;
- expected profit: `$2,440`;
- entered-cost break-even: `$3.77/bu`.

The judge then asks `fertilizer cost rises by 20%`. Gemma returns a typed `increasePercent` operation for fertilizer. HarvestWise applies the operation to the original plan, adds `$1,680` to modeled cost, and recalculates expected profit to `$760`. The UI shows `Gemma interpreted the change`; the baseline remains `$2,440` and the Decision Pack records the scenario separately.

![Verified U.S. Midwest Gemma scenario](screenshots/gemma-us-scenario-proof.png)

## Why Gemma is necessary

Gemma provides the language layer that a form or calculator cannot:

- extracts structured assumptions from a farmer note;
- converts ordinary what-if language into typed scenario operations;
- explains deterministic results in concise farmer-friendly language;
- creates a short message for an advisor, buyer, or cooperative conversation.

The server instructs Gemma to return one JSON object, extracts the object locally, and validates it before use. A malformed or unavailable model response cannot become financial truth; the app either rejects it or uses an explicitly labelled local fallback.

## Responsible AI boundary

The central promise is **Gemma explains; HarvestWise calculates**.

- `src/domain/finance.ts` owns revenue, cost, break-even, risk context, and plan calculations.
- `src/domain/farmerAction.ts` owns the recommended action.
- `server/gemmaStructured.ts` maps notes and questions into structured data and operations.
- `server/gemmaAdvisor.ts` explains results that have already been calculated.
- Price evidence and NWS weather are context only; neither changes finance or the action.
- Scenario operations are reapplied to an immutable baseline, preventing accidental compounding.

## Working production proof

Verified on 2026-07-14:

- production: <https://harvestwise-ai.vercel.app>;
- 87 tests in 15 files passed;
- TypeScript and the production build passed;
- the 320 px production layout had no horizontal overflow or console errors;
- `/api/health` returned HTTP 200;
- the fertilizer scenario returned provider `gemma` and `$2,440 -> $760`;
- Advisor calls remained intermittent and could return `Local fallback answer`; that fallback is visibly labelled and is not part of the core recorded story.

## External benchmark — credibility check, not validation

The [University of Illinois Extension 2026 Central Illinois outlook](https://extension.illinois.edu/blogs/farm-focus/2026-01-23-farm-economic-outlook-central-illinois-2026) provides a useful directional comparison:

| Metric | HarvestWise demo | Illinois Extension 2026 |
| --- | ---: | ---: |
| Corn yield | 220 bu/acre | 241 bu/acre |
| Corn price | $4.05/bu | $4.25/bu |
| Modeled or total cost | $830/acre | $1,135/acre |
| Expected return | +$61/acre | -$55/acre |
| Break-even | $3.77/bu | $4.71/bu |

This is deliberately not like-for-like. The Illinois budget covers broader economic costs and includes an estimated `$56/acre` ARC/PLC payment in gross revenue. HarvestWise models only the categories entered in the app. The comparison therefore demonstrates the product's limitation: `$3.77/bu` is an entered-cost screening threshold, not a complete economic break-even.

## Limitations and what is not yet validated

- The product is a planning prototype, not agronomic, legal, investment, or financial advice.
- The farmer-entered price is not a live quote and must be confirmed with a buyer, co-op, or elevator.
- The model excludes insurance, debt service, taxes, complete machinery and overhead costs, and government payments.
- Risk bands are transparent planning heuristics, not externally calibrated predictions.
- Crop coverage is limited to Corn, Soybeans, and Wheat; optional NWS context covers a few representative Midwest locations.
- The hosted model can be intermittent. Fallback keeps the plan usable but does not count as live Gemma output.
- A live Gemma request sends the submitted note or question and relevant plan context to the configured Google GenAI service; the prototype should not receive sensitive personal or financial identifiers.
- Farmer and advisor interviews have not yet been completed, so the project does not claim field validation.

## Submission links

- Production: <https://harvestwise-ai.vercel.app>
- Source: <https://github.com/dsvyro1414-lab/HarvestWise-AI>
- U.S. baseline and benchmark: [us-baseline.md](us-baseline.md)
- Current production proof: [gemma-us-scenario-proof.png](screenshots/gemma-us-scenario-proof.png)
- License: [MIT](../LICENSE)

The remaining submission asset is the real 60-75 second recording. Its URL should be added to the private submission form only after the recording exists; no placeholder link should be presented to judges.
