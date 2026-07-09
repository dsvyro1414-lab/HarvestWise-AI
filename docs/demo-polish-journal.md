# Demo Polish Journal

Last reviewed: 2026-07-09

Use this journal to track demo-readiness issues before submitting HarvestWise AI.

## Completed In Current Main

- Simplified the app from sidebar + tabs into a focused dashboard with topbar navigation.
- Removed several dead-looking controls from the primary surface, including the old settings/logout sidebar actions and the always-visible update button.
- Made the first viewport denser: assumptions, profit chart, market decision, and advisor notes now appear together on desktop.
- Refined the HarvestWise AI logo, favicon, tagline, and brand palette based on the reference image.
- Added Vercel-compatible API entrypoints in `api` for health, advice, interview extraction, and scenario parsing.
- Strengthened the price sensitivity chart with a current price marker and tooltip.
- Added a README judge demo path.

## High Priority

1. Make live Gemma status obvious.
   - Status: still open.
   - Current observation: the advisor panel can show `Local fallback ready` when no API key is configured, which may make judges think the AI integration is not active.
   - Desired outcome: after successful Gemma calls, the UI should clearly show `Gemma extracted`, `Gemma operations`, or `Live AI explanation`.
   - Areas to inspect: `src/features/farm-plan/FarmInterviewCopilot.tsx`, `src/features/scenario/ScenarioModePanel.tsx`, `src/features/advisor/AdvisorPanel.tsx`, `server/gemmaStructured.ts`, `server/gemmaAdvisor.ts`.

2. Avoid confusion between frontend and backend URLs.
   - Status: partially addressed.
   - Current observation: Vercel has an `api/health.ts` endpoint, but opening the local Express root `http://localhost:8787/` may still show backend-only behavior.
   - Desired outcome: add a friendly API root response or help text that points users to the Vite app on `5173`.
   - Areas to inspect: `server/index.ts`, `api/health.ts`.

3. Remove or implement empty demo actions.
   - Status: mostly addressed.
   - Current observation: old sidebar actions are gone. The `Breakdown` link still looks like a future action and should either work, scroll to details, or be hidden for the final demo.
   - Desired outcome: wire remaining future-looking actions to real views, hide them for the hackathon demo, or mark them as disabled/coming soon.
   - Areas to inspect: `src/features/farm-plan/ProfitSnapshot.tsx`, `src/features/crop-comparison/CropComparisonTable.tsx`, `src/components/layout/AppShell.tsx`.

4. Clarify the primary demo flow.
   - Status: improved, still open.
   - Current observation: README now has a judge demo path, but the app itself still relies on the default sample assumptions and manual scenario entry.
   - Desired outcome: a clear flow from sample plan or interview extraction, to deterministic recalculation, to scenario mode, to advisor notes.
   - Candidate feature: `Load sample plan` or `Demo plan` button.
   - Areas to inspect: `src/app/App.tsx`, `src/features/farm-plan/FarmInputPanel.tsx`.

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

The app now looks like a polished product dashboard rather than a placeholder. The next round should focus on demo trust: prove live Gemma behavior when a key is available, make remaining future-looking actions intentional, and add a fast sample-plan path for judges.
