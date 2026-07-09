# Demo Polish Journal

Last reviewed: 2026-07-09

Use this journal to track demo-readiness issues that should be fixed before submitting HarvestWise AI. These are observations from the running local dashboard, not completed fixes.

## High Priority

1. Make live Gemma status obvious.
   - Current observation: the advisor panel can show `Local fallback ready`, which may make judges think the AI integration is not active.
   - Desired outcome: after successful Gemma calls, the UI should clearly show `Gemma extracted`, `Gemma operations`, or `Live AI explanation`.
   - Areas to inspect: `src/features/farm-plan/FarmInterviewCopilot.tsx`, `src/features/scenario/ScenarioModePanel.tsx`, `src/features/advisor/AdvisorPanel.tsx`, `server/gemmaStructured.ts`, `server/gemmaAdvisor.ts`.

2. Avoid confusion between frontend and backend URLs.
   - Current observation: opening `http://localhost:8787/` shows `Cannot GET /`, because this is the API server root.
   - Desired outcome: add a friendly API root response or redirect/help text that points users to the Vite app on `5173`.
   - Areas to inspect: `server/index.ts`, `api/health.ts`.

3. Remove or implement empty demo actions.
   - Current observation: buttons such as `View full breakdown`, `View full comparison`, `Settings`, and `Logout` may look clickable even if they do not do anything meaningful.
   - Desired outcome: either wire them to real views, hide them for the hackathon demo, or mark future-only actions as disabled/coming soon.
   - Areas to inspect: `src/features/farm-plan/ProfitSnapshot.tsx`, `src/features/crop-comparison/CropComparisonTable.tsx`, `src/components/layout/AppShell.tsx`.

4. Clarify the primary demo flow.
   - Current observation: the dashboard is functional, but the best judge path is not explicit enough.
   - Desired outcome: a clear flow from sample plan or interview extraction, to deterministic recalculation, to scenario mode, to advisor notes.
   - Candidate feature: `Load sample plan` or `Demo plan` button.
   - Areas to inspect: `src/app/App.tsx`, `src/features/farm-plan/FarmInputPanel.tsx`.

## Medium Priority

5. Reduce navigation ambiguity.
   - Current observation: the left sidebar highlights `Dashboard`, while the center tabs highlight `Farm Plan`.
   - Desired outcome: sidebar and tabs should not imply two competing navigation states.
   - Possible fixes: simplify sidebar, make it scroll/section navigation, or align active state with the central workspace.
   - Areas to inspect: `src/components/layout/AppShell.tsx`, `src/app/App.tsx`.

6. Improve number readability in inputs.
   - Current observation: input values like `320000` and `65000` are harder to scan than formatted currency.
   - Desired outcome: show financial values with separators, while preserving reliable numeric editing.
   - Areas to inspect: `src/components/ui/NumberField.tsx`, `src/utils/formatters.ts`.

7. Make the default plan feel more realistic.
   - Current observation: ROI around `241%`, profit margin around `71%`, and `Low` risk can feel too optimistic.
   - Desired outcome: either moderate the default assumptions or label them clearly as demo/sample assumptions.
   - Areas to inspect: `src/domain/crops.ts`, `src/domain/advice.ts`, dashboard copy.

8. Strengthen the price sensitivity chart.
   - Current observation: the chart looks polished but is light on explanatory detail.
   - Desired outcome: add clearer axis labels, price/profit point labels, and a visible danger zone below break-even.
   - Areas to inspect: `src/features/farm-plan/PriceSensitivityChart.tsx`.

## Lower Priority

9. Improve above-the-fold density.
   - Current observation: on a laptop screen the right-side action buttons sit low and the page feels slightly cramped vertically.
   - Desired outcome: make the first viewport show the core demo path without excessive scrolling.
   - Areas to inspect: `src/styles/global.css`, `src/features/advisor/AdvisorPanel.tsx`.

10. Document the judge demo script.
    - Current observation: the repo explains the product, but the exact 60-90 second demo path should be easier to follow.
    - Desired outcome: add a short README section with the recommended live demo steps and expected UI states.
    - Areas to inspect: `README.md`, `docs/submission-brief.md`.

## Current Assessment

The app already looks like a real product dashboard rather than a placeholder. The next round should focus on demo trust: make the Gemma integration visibly live, remove dead-looking controls, clarify navigation, and make the judge path obvious.
