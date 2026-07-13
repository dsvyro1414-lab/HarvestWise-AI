# HarvestWise AI — Handoff

Read this file first when continuing the project. It is the current source of truth for the next session.

## Product goal

HarvestWise AI is a trustworthy, hackathon-ready farm-profit planner for a U.S. Midwest grain demo. A farmer enters assumptions, HarvestWise calculates the plan deterministically, then Gemma interprets the result in farmer-friendly language.

The product's central promise is: **Gemma explains; HarvestWise calculates.** Gemma must never become the source of finance, risk, or the recommended action.

## Current state — 2026-07-14

- Branch: `codex/guided-interview-action-pack`
- GitHub default branch: `main`; the submission-hardening release is published to both this branch and `main` so the repository root matches the deployed product.
- Deployed product-code baseline: `8738be9 Fix locale inputs and scenario testing`; the later submission release changes documentation and evidence only.
- Production URL: <https://harvestwise-ai.vercel.app>
- Vercel builds production from default `main`; use `vercel inspect harvestwise-ai.vercel.app` when the current immutable deployment URL is needed.

The agreed locale and scenario fixes plus release-review hardening are committed, pushed, and deployed:

- `npm test` — 87 tests in 15 files passed.
- `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- Fresh production desktop and 320 px browser checks passed with no horizontal overflow, Vite overlay, or console errors. At 320 px the document, scenario composer, input, and result all remained within the viewport.
- Production confirmed `4,05` → `$4.05`, expected profit `$2,440`, and a live Gemma scenario at `$760`. An identical production rerun stayed at `$2,440` → `$760`, proving no compounding.
- The Decision Pack kept the canonical `$2,440` plan and the separate `$760` scenario record; `Copy summary` completed successfully.
- Production `/api/scenario` and `/api/advice` requests returned HTTP 200. The advisor used a clearly labelled `Local fallback answer` during an intermittent provider failure.

The final production evidence in this file is followed by a submission-hardening release. Check `git status --short --branch` and verify `origin/main` before starting new work.

## Submission hardening completed — 2026-07-14

- The full current product history is published through GitHub's default `main` branch, not only the feature branch.
- A fresh U.S./USD production capture replaces the Nigeria/Naira image in the README. It visibly shows `Gemma interpreted the change` and `$2,440 -> $760`.
- `README.md`, `docs/submission-brief.md`, `explain.md`, `docs/demo-polish-journal.md`, and `docs/us-baseline.md` now describe the same vertical U.S. Midwest product flow.
- `docs/submission-brief.md` is the canonical final write-up.
- The repository includes an MIT `LICENSE` file and an explicit limitations section.
- `docs/us-baseline.md` includes a directional, not-like-for-like comparison with the University of Illinois Extension 2026 Central Illinois corn budget.
- No farmer or advisor testimonials were invented. External interviews remain optional follow-up evidence.

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

Record and attach the final 60-75 second judge video:

1. Enter Corn, `40 acres`, `$35,000`, `220 bu/acre`, and `$4.05/bu`.
2. Show **Plant this plan**, expected profit `$2,440`, and entered-cost break-even `$3.77/bu`.
3. Run `fertilizer cost rises by 20%`.
4. Show `Gemma interpreted the change` and `$2,440 -> $760`.
5. Show the unchanged baseline and the Decision Pack.

Before recording, open a clean production tab and preflight this exact scenario because the upstream model can be intermittent. `gemma-4-26b-a4b-it` is configured correctly and the production scenario returned provider `gemma` again on 2026-07-14. Advisor calls remain intermittent and may return a clearly labelled local fallback, so Advisor is optional in the core recording. Never present fallback text as model output.

After recording, complete the private Kaggle submission fields and attach the real video URL. Do not add a placeholder URL to the repository. If time permits, collect 3-5 short farmer or advisor reviews and document what changed after their feedback.

## Verified submission checklist

1. `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.
2. The clean production path passed: plan → deterministic action → scenario → advisor explanation/fallback → Decision Pack.
3. Live Gemma scenario output and the labelled local fallback were both verified.
4. Production at 320 px had no horizontal overflow and no browser console errors.
5. Judge story: enter a realistic plan, show the deterministic action and break-even, run `fertilizer cost rises by 20%`, show the live Gemma provider label, then open the Decision Pack.
6. The ordinary GitHub repository URL opens the same current product history as the production deployment.
7. Every judge-facing screenshot and worked example uses the U.S. Midwest/USD baseline.

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
