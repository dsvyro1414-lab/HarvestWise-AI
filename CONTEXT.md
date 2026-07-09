# HarvestWise AI - Session Context

Use this file as the first read in the next Codex session.

## Current Goal

Build and polish **HarvestWise AI** for the Kaggle / GDGOC LAUTECH "Build with Gemma" hackathon:

https://www.kaggle.com/c/build-with-gemma-gdgoc-lautech

The product is a Gemma-powered farm profit planner for smallholder farmers and cooperative advisors. It combines agriculture and finance, but it is not a lending or credit product.

Core question:

> Can this farm season make money before the farmer spends money?

## Current Snapshot

The latest polished version is on `main` and pushed to GitHub.

Current `main` head:

```bash
18b8395 Refine brand logo and palette
```

This includes the simplified dashboard UI, final HarvestWise AI logo/palette, Vercel API entrypoints, and updated demo documentation.

## Product Idea

HarvestWise AI helps a farmer or advisor enter a farm season plan and see whether it is financially sensible.

The app calculates:

- total season cost;
- expected revenue;
- expected profit;
- break-even market price;
- ROI;
- budget gap;
- risk level;
- simple next action.

It also compares crop choices and market decisions such as selling now vs storing for later.

## Important Positioning

The user explicitly moved away from a credit/loan angle. Keep the concept focused on:

- farm profitability;
- crop planning;
- cost risk;
- market timing;
- cooperative/advisor workflows;
- simple financial literacy for farmers.

Do not turn it into a banking, loan scoring, or microcredit product unless the user asks.

## Gemma Integration Boundary

This boundary is important for judging and code quality:

- Gemma extracts structured inputs from natural language.
- Gemma maps scenario questions into parameter changes.
- Gemma explains deterministic results in plain language.
- Gemma does **not** calculate finances.

All financial math stays in the deterministic TypeScript domain layer.

Main implementation files:

- `src/domain/finance.ts` - deterministic calculations.
- `src/domain/patches.ts` - typed patch and scenario operation application.
- `server/gemmaAdvisor.ts` - advisor notes and farmer explanation.
- `server/gemmaStructured.ts` - structured Gemma calls for interview and scenario extraction.
- `server/localParsers.ts` - offline fallback parsers for demo resilience.
- `server/index.ts` - Express API routes.
- `api/advice.ts`, `api/interview.ts`, `api/scenario.ts`, `api/health.ts` - Vercel-compatible API entrypoints.

## Implemented Features

The current app includes:

- simplified topbar dashboard layout;
- farm assumptions panel;
- profit snapshot with deterministic finance metrics;
- price sensitivity chart with current price marker;
- crop comparison table;
- market decision cards;
- advisor notes panel;
- farm interview copilot;
- scenario mode;
- one-click Balanced, Risky, and Loss-making sample plans;
- Iowa, United States market context in USD;
- Gemma API integration with local fallbacks;
- Vercel serverless API entrypoints;
- final HarvestWise AI logo, favicon, and brand palette;
- Vitest domain tests;
- generated dashboard concept image.

Natural-language interview examples should update the form:

```text
I want to plant corn on 160 acres in Iowa. My budget is $145k. Seed is $125 per acre, fertilizer is $210 per acre, labor and operations are $470 per acre. I expect 210 bushels per acre and the market price is $4.55 per bushel.
```

Scenario examples should change parameters and recalculate through the domain layer:

```text
what if fertilizer cost rises by 20%?
what if I store for 2 months?
what if corn price drops by 15%?
```

## Repository Status

Public GitHub repository:

https://github.com/dsvyro1414-lab/HarvestWise-AI

Current local branch:

```bash
main
```

Important pushed commits:

```bash
d484096 Initial HarvestWise AI implementation
1c92584 Add session context handoff
4ee9c53 Improve and simplify UI
18b8395 Refine brand logo and palette
```

The repository was created as `HarvestWise-AI` because GitHub slugs do not support spaces. Product name in the app/docs is **HarvestWise AI**.

## Run Locally

```bash
npm install
npm run dev
```

The Vite app usually runs on:

```text
http://localhost:5173
```

Optional Gemma environment:

```bash
cp .env.example .env
```

Then set:

```bash
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-3-27b-it
```

Without a key, the demo still works through deterministic local fallbacks.

## Validation Already Done

These checks passed during development:

```bash
npm test
npm run build
```

Latest validation after the final UI/logo polish:

```bash
npm run build
```

Manual browser checks were also done for:

- desktop layout;
- mobile layout;
- final logo and palette render;
- interview extraction fallback;
- scenario: fertilizer +20%;
- scenario: store for 2 months.
- sample plans: Balanced, Risky, Loss-making.

## Key Files To Read Next

For product direction:

- `explain.md`
- `docs/submission-brief.md`
- `docs/demo-polish-journal.md`
- `README.md`

For implementation:

- `src/app/App.tsx`
- `src/domain/finance.ts`
- `src/domain/patches.ts`
- `server/gemmaStructured.ts`
- `server/gemmaAdvisor.ts`
- `src/features/farm-plan/FarmInterviewCopilot.tsx`
- `src/features/scenario/ScenarioModePanel.tsx`

For visuals:

- `src/styles/global.css`
- `src/components/layout/AppShell.tsx`
- `public/favicon.svg`
- `assets/concepts/harvestwise-dashboard-concept.png`

## Suggested Next Steps

Most valuable next work:

1. Make live Gemma status more obvious after successful model calls.
2. Add screenshots or a short demo GIF to the README.
3. Add a friendly API root/help response for people who open the backend URL directly.
4. If a real Gemma key is available, verify live model responses end to end.
5. Deploy or verify the Vercel deployment if the user asks.

## Style Notes

The user prefers Russian communication.

The code should stay clean and scalable:

- keep domain math pure and testable;
- keep Gemma prompts isolated server-side;
- keep UI components reusable;
- avoid mixing AI output with authoritative financial calculations;
- preserve fallback behavior so the demo works without API credentials.
