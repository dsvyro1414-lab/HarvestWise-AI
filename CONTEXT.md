# HarvestWise AI — Current Handoff

Read this file before continuing work on HarvestWise AI.

## Goal

Build a clear, trustworthy farm-profit planner for the Kaggle / GDGOC LAUTECH **Build with Gemma** hackathon.

The product helps a smallholder farmer or cooperative advisor answer one question before money is spent:

> What should I do next with this farm plan?

HarvestWise AI is not a lending, credit-scoring, or loan-recommendation product.

## Current State

- Branch: `main`
- Latest pushed commit: `71ce104 Add deterministic farmer actions`
- GitHub: <https://github.com/dsvyro1414-lab/HarvestWise-AI>
- Production: <https://harvestwise-ai.vercel.app>
- Last validated: 2026-07-10

The Vercel project is linked as `dsvyro1414-labs-projects/harvestwise-ai`. Production has encrypted `GEMINI_API_KEY` and `GEMMA_MODEL` variables. Live extraction, scenario interpretation, and a concise validated explanation have all been observed; evidence is in `docs/screenshots/` and the README.

Production currently includes uncommitted local reliability fixes, so GitHub `main` remains behind the deployed build until these changes are committed and pushed.

The current UI has one deliberate primary path:

1. Enter five core assumptions: crop, land, budget, expected harvest, and market price.
2. Read the deterministic **Recommended next action** and its two reasons.
3. Inspect profit, break-even price, and cash status.
4. Open scenario, crop, price, or market details only when needed.
5. Ask Gemma to structure a farm note or explain the already-calculated result.

## Deterministic Action Layer

`src/domain/farmerAction.ts` now owns the single recommendation shown first in the product. It returns a typed action, stage, reasons, and an optional storage-price threshold.

Possible actions:

- `Plant this plan`
- `Reduce acreage before planting`
- `Secure a buyer before planting`
- `Do not plant yet`
- `Store only if price exceeds ₦X per unit`

The storage threshold means: the minimum future unit price at which storing beats selling immediately, after storage cost and harvest loss.

`src/domain/finance.ts` composes this action into every farm plan. There is no parallel `bestAction` string anymore.

## Gemma Boundary

Gemma is intentionally an interpretation and explanation layer, never the financial authority.

- Gemma extracts structured assumptions from a natural-language farm note.
- Gemma converts what-if questions into typed parameter operations.
- Gemma explains the deterministic plan and can generate a WhatsApp explanation.
- The TypeScript domain layer calculates cost, revenue, risk, price thresholds, and the recommended action.
- Gemma cannot calculate finance outputs, choose an action, replace an action, or reword the recommended action.

Server-side prompts are isolated in:

- `server/gemmaStructured.ts`
- `server/gemmaAdvisor.ts`

Both use schema-constrained JSON. The default hosted model is `gemma-4-26b-a4b-it`; `GEMMA_MODEL` may override it.

When no `GEMINI_API_KEY` is configured, local parsers and explanations keep the demo functional and are labelled as local fallback.

## Main Implementation Files

- `src/app/App.tsx` — composition and state.
- `src/domain/finance.ts` — pure finance calculation.
- `src/domain/farmerAction.ts` — deterministic next-action logic.
- `src/domain/finance.test.ts` — finance and decision tests.
- `src/features/farm-plan/FarmerActionCard.tsx` — primary action UI.
- `src/features/farm-plan/FarmInputPanel.tsx` — core and advanced assumptions.
- `src/features/farm-plan/ProfitSnapshot.tsx` — compact plan snapshot and optional detail.
- `src/features/advisor/AdvisorPanel.tsx` — explicit Gemma explanation boundary.
- `server/gemmaStructured.ts` — interview/scenario extraction.
- `server/gemmaAdvisor.ts` — explanation and WhatsApp output.

## Validation Completed

The following pass on commit `71ce104`:

```bash
npm test       # 8 tests passed
npm run typecheck
npm run build
```

Browser smoke checks also passed on desktop and a 390 px mobile viewport:

- the first viewport shows the action and three key metrics;
- no console errors or Vite overlay;
- changing the market price to ₦600 changes the action to `Do not plant yet` with calculated reasons;
- the scenario section opens and states that Gemma interprets while HarvestWise recalculates.

## Most Logical Next Step

Run and record one **live Gemma proof flow** for judges. Do not add another large product feature first.

Definition of done:

1. Configure `GEMINI_API_KEY` in the deployed demo.
2. Use a known farm note to show `Gemma extracted` and the updated deterministic action.
3. Run one what-if question and show `Gemma interpreted the change` plus the recalculated profit/action.
4. Request an explanation and show `Gemma explanation · deterministic decision`.
5. Capture this as a short GIF/video or 3–4 README screenshots.

See `docs/next-step.md` for the exact demo script and acceptance criteria.

## Working Style

- Keep financial math pure and testable in `src/domain`.
- Keep prompts and API keys server-side.
- Preserve local fallbacks.
- Keep the first screen focused on one farmer action; put expert analysis behind disclosure controls.
- Prefer explicit, honest AI status over implying that fallback output came from Gemma.
