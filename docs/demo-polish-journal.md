# Demo Polish Journal

Last reviewed: 2026-07-10

Use this journal to track demo-readiness issues before submitting HarvestWise AI.

## Completed In Current Main

- Simplified the app from sidebar + tabs into a focused workspace with a minimal topbar.
- Removed several dead-looking controls from the primary surface, including the old settings/logout sidebar actions and the always-visible update button.
- Made the first viewport denser: assumptions, profit chart, market decision, and advisor notes now appear together on desktop.
- Refined the HarvestWise AI logo, favicon, tagline, and brand palette based on the reference image.
- Added Vercel-compatible API entrypoints in `api` for health, advice, interview extraction, and scenario parsing.
- Strengthened the price sensitivity chart with a current price marker and tooltip.
- Added a README judge demo path.
- Added a typed deterministic `buildFarmerAction` layer with reasons and a storage-price threshold.
- Put **Recommended next action** first in the UI; moved scenarios, crop comparison, price details, and market options behind disclosure controls.
- Reduced the assumptions panel to five core fields, with cost and storage inputs available on demand.
- Reframed Gemma as an extractor/interpreter/explainer and added schema-constrained JSON responses.
- Updated the default hosted Gemma model to `gemma-4-26b-a4b-it`.

## High Priority

1. Prove live Gemma behavior.
   - Status: open; this is the next recommended task.
   - Current observation: the UI now accurately explains the AI boundary and labels successful providers, but no live key-backed demo recording has been captured.
   - Desired outcome: show a successful extraction, scenario interpretation, and explanation with a valid key; capture evidence for judges.
   - Areas to inspect: `src/features/farm-plan/FarmInterviewCopilot.tsx`, `src/features/scenario/ScenarioModePanel.tsx`, `src/features/advisor/AdvisorPanel.tsx`, `server/gemmaStructured.ts`, `server/gemmaAdvisor.ts`.

2. Avoid confusion between frontend and backend URLs.
   - Status: partially addressed.
   - Current observation: Vercel has an `api/health.ts` endpoint, but opening the local Express root `http://localhost:8787/` may still show backend-only behavior.
   - Desired outcome: add a friendly API root response or help text that points users to the Vite app on `5173`.
   - Areas to inspect: `server/index.ts`, `api/health.ts`.

3. Remove or implement empty demo actions.
   - Status: completed.
   - Current observation: the unused `Breakdown` link was removed; optional analysis is now provided through native disclosure controls.
   - Areas to inspect: `src/features/farm-plan/ProfitSnapshot.tsx`, `src/features/crop-comparison/CropComparisonTable.tsx`, `src/components/layout/AppShell.tsx`.

4. Clarify the primary demo flow.
   - Status: completed for the local path; live Gemma evidence remains open.
   - Current observation: the default plan leads directly to Recommended next action, then compact metrics, with deeper analysis hidden until requested.
   - Desired outcome: use the live Gemma proof flow in `docs/next-step.md` for the final recording.

## Medium Priority

5. Reduce navigation ambiguity.
   - Status: completed.
   - Current observation: the old sidebar and central tabs were replaced by topbar section links.
   - Desired outcome: no further action unless new pages are added.
   - Areas to inspect: `src/components/layout/AppShell.tsx`, `src/app/App.tsx`.

6. Improve number readability in inputs.
   - Status: still open.
   - Current observation: input values like `320000` and `65000` are harder to scan than formatted currency.
   - Desired outcome: show financial values with separators, while preserving reliable numeric editing.
   - Areas to inspect: `src/components/ui/NumberField.tsx`, `src/utils/formatters.ts`.

7. Make the default plan feel more realistic.
   - Status: still open.
   - Current observation: ROI around `241%`, profit margin around `71%`, and `Low` risk can feel too optimistic.
   - Desired outcome: either moderate the default assumptions or label them clearly as demo/sample assumptions.
   - Areas to inspect: `src/domain/crops.ts`, `src/domain/advice.ts`, dashboard copy.

8. Strengthen the price sensitivity chart.
   - Status: partially addressed.
   - Current observation: the chart now shows current price and profit. It still does not have a strong danger zone below break-even.
   - Desired outcome: add a visible danger zone below break-even if time allows.
   - Areas to inspect: `src/features/farm-plan/PriceSensitivityChart.tsx`.

## Lower Priority

9. Improve above-the-fold density.
   - Status: completed for desktop and mobile smoke checks.
   - Current observation: the first viewport now shows the core demo path more clearly.
   - Desired outcome: revisit only after adding new controls or demo data.
   - Areas to inspect: `src/styles/global.css`, `src/features/advisor/AdvisorPanel.tsx`.

10. Document the judge demo script.
    - Status: completed in `README.md`.
    - Current observation: README now includes a recommended 60-90 second demo path.
    - Desired outcome: add screenshots or a short GIF if time allows.
    - Areas to inspect: `README.md`, `docs/submission-brief.md`.

## Current Assessment

The app now prioritizes a farmer decision rather than a collection of calculations. The next round should focus on demo trust: prove live Gemma behavior with a key, capture evidence, and keep fallback labels honest.
