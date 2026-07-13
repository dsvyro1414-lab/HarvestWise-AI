# HarvestWise AI — Handoff

Read this file first when continuing the project. It is the current source of truth for the next session.

## Product goal

HarvestWise AI is a trustworthy, hackathon-ready farm-profit planner for a U.S. Midwest grain demo. A farmer enters assumptions, HarvestWise calculates the plan deterministically, then Gemma interprets the result in farmer-friendly language.

The product's central promise is: **Gemma explains; HarvestWise calculates.** Gemma must never become the source of finance, risk, or the recommended action.

## Current state — 2026-07-13

- Branch: `codex/guided-interview-action-pack`
- Deployed product commit: `8738be9 Fix locale inputs and scenario testing`
- Production URL: <https://harvestwise-ai.vercel.app>
- Immutable deployment URL: <https://harvestwise-87it4qxhk-dsvyro1414-labs-projects.vercel.app>

The agreed locale and scenario fixes plus release-review hardening are committed, pushed, and deployed:

- `npm test` — 87 tests in 15 files passed.
- `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- Fresh production desktop and 320 px browser checks passed with no horizontal overflow, Vite overlay, or console errors. At 320 px the document, scenario composer, input, and result all remained within the viewport.
- Production confirmed `4,05` → `$4.05`, expected profit `$2,440`, and a live Gemma scenario at `$760`. An identical production rerun stayed at `$2,440` → `$760`, proving no compounding.
- The Decision Pack kept the canonical `$2,440` plan and the separate `$760` scenario record; `Copy summary` completed successfully.
- Production `/api/scenario` and `/api/advice` requests returned HTTP 200. The advisor used a clearly labelled `Local fallback answer` during an intermittent provider failure.

The final production evidence in this file is a documentation-only follow-up after the deployed product commit. Check `git status --short --branch` before starting new work.

## Completed recently

1. **Narrow mobile layout**
   - Removed the fixed narrow-screen width constraint.
   - Verified no horizontal scroll at 280 px and 320 px.

2. **Gemma wait experience**
   - Added timed, human-readable progress messages and visible elapsed time while waiting for an explanation.
   - Limited the advisor response length to keep answers concise.
   - This does not add streaming; network/model latency can still occur.

3. **Price evidence instead of a paid live-price API**
   - The farmer can record source type, source/contact, market/location, and confirmation date for the entered price.
   - Evidence is labelled fresh, aging, stale, or unverified.
   - It is informational only and does not alter deterministic finance.
   - No live price API is called by the current UI. Do not reintroduce USDA or Twelve Data as a default price source without an explicit product decision.

## Completed in the current working tree

### 1. P0 — decimal separators and locale-safe numbers

Direct inputs and local text parsers now share finite, locale-safe numeric normalization.

- `4.05` and `4,05` produce the same value; U.S. result formatting remains `$4.05`.
- Incomplete input such as `4,` stays as an editing draft, never enters plan state as `NaN`, and returns to the last valid value on blur.
- Interview and scenario fallbacks accept comma decimals such as `10,2`.
- Ambiguous bare values such as `1,234` are rejected instead of guessed. Explicit U.S. currency context such as `$1,234` permits grouping.
- Regression tests cover direct parsing, local interview extraction, scenario percentages, budget isolation, and cash-rent wording.

Implementation files:

- `src/components/ui/NumberField.tsx`
- `server/localParsers.ts`
- `src/utils/numericNormalization.ts`
- their adjacent test files

### 2. P1 — make “Test a change” feel local and immediate

The scenario composer now opens inside the baseline-vs-what-if section instead of a distant disclosure.

- The first activation reveals the composer and focuses the labelled what-if field.
- The composer appears before the result, so a new comparison arrives immediately below the question on desktop and mobile.
- Baseline and latest scenario stay side-by-side on desktop and stack cleanly at 320 px.
- The provider label remains explicit: `Gemma interpreted the change` or `Local interpreter`.
- Gemma/local fallback still produces only typed operations; local TypeScript applies the patch and recalculates finance.

### 3. Release-review hardening — immutable scenarios and safe parsing

- A what-if never mutates the canonical farm plan. Repeating the same scenario always starts from the same baseline.
- The client ignores server-provided patches, rebuilds them from typed operations, and calculates before/after finance locally.
- Empty and unchanged scenarios show an inline validation message without replacing the previous valid result.
- Scenario requests ignore stale responses after a plan edit; fields and submit controls are disabled while a request is active.
- Numeric text parsing rejects partial or ambiguous tokens, keeps operations clause-local, and separates monthly price growth from current market price.
- Number fields enforce their configured range while preserving locale-safe editing drafts and accessible invalid feedback.

Implementation files:

- `src/features/post-plan/PostPlanDashboard.tsx`
- `src/features/scenario/ScenarioModePanel.tsx`
- `src/app/App.tsx`
- `src/domain/scenario.ts`
- `src/styles/global.css`

## Next delivery step

There is no remaining code or deployment work from this handoff. Before the judge demo, open a clean production tab and retry the 60–90 second story once because the upstream model can be intermittent.

Live-provider note from 2026-07-13: `gemma-4-26b-a4b-it` is configured correctly and both local and production browser scenarios returned provider `gemma`. The same production question was run twice and both comparisons stayed at baseline `$2,440` → scenario `$760`. Advisor calls were intermittent: local attempts produced malformed JSON or exhausted provider retries with a `500`, and the production advisor also returned the labelled fallback. Keep the labels honest and retry live Gemma before the judge demo; never present fallback text as model output.

GitHub delivery note: branch `codex/guided-interview-action-pack` is pushed through `8738be9`. Draft PR creation was attempted, but the installed GitHub integration returned `403 Resource not accessible by integration`, while the local `gh` token is invalid. No PR was opened.

## Verified submission checklist

1. `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.
2. The clean production path passed: plan → deterministic action → scenario → advisor explanation/fallback → Decision Pack.
3. Live Gemma scenario output and the labelled local fallback were both verified.
4. Production at 320 px had no horizontal overflow and no browser console errors.
5. Judge story: enter a realistic plan, show the deterministic action and break-even, run `fertilizer cost rises by 20%`, ask Gemma to explain, then copy or print the Decision Pack.

## Important architecture and boundaries

- `src/domain/finance.ts` owns revenue, cost, risk, break-even, and plan calculations.
- `src/domain/farmerAction.ts` owns the deterministic recommended action.
- `server/gemmaStructured.ts` maps notes and scenario questions into structured operations.
- `server/gemmaAdvisor.ts` produces explanations and WhatsApp wording.
- `src/domain/priceEvidence.ts` owns price-source labels and freshness. It must stay advisory-only.
- `server/nwsWeather.ts` is optional timing context only; it must not change finance or actions.
- Local fallbacks are a feature, not an error: label them clearly and keep the app usable without a successful model request.

## Documentation note

`CONTEXT.md` is deliberately archived. `docs/next-session.md` points here, and the README/U.S. baseline now describe farmer-recorded price evidence instead of the removed USDA Market Pulse flow.
