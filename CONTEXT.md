# HarvestWise AI - Session Context

Use this file as the first read in the next Codex session.

## Current Goal

Build and polish **HarvestWise AI** for the Kaggle / GDGOC LAUTECH "Build with Gemma" hackathon:

https://www.kaggle.com/c/build-with-gemma-gdgoc-lautech

The product is a Gemma-powered farm profit planner for smallholder farmers and cooperative advisors. It combines agriculture and finance, but it is not a lending or credit product.

Core question:

> Can this farm season make money before the farmer spends money?

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

## Implemented Features

The current app includes:

- farm input dashboard;
- profit snapshot with deterministic finance metrics;
- crop comparison table;
- market decision cards;
- advisor notes panel;
- farm interview copilot;
- scenario mode;
- Gemma API integration with local fallbacks;
- Vitest domain tests;
- generated dashboard concept image.

Natural-language interview examples should update the form:

```text
I want to plant maize on 2 acres. My budget is 250000 naira. Seed is 35000, fertilizer is 80000, labor is 60000, transport is 20000. I expect 3200 kg and the market price is 180 per kg.
```

Scenario examples should change parameters and recalculate through the domain layer:

```text
what if fertilizer cost rises by 20%?
what if I store for 2 months?
what if market price drops by 15%?
```

## Repository Status

Public GitHub repository:

https://github.com/dsvyro1414-lab/HarvestWise-AI

Current local branch:

```bash
main
```

Initial pushed commit:

```bash
d484096 Initial HarvestWise AI implementation
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

These checks passed before the initial GitHub push:

```bash
npm test
npm run build
```

Manual browser checks were also done for:

- desktop layout;
- mobile layout;
- interview extraction fallback;
- scenario: fertilizer +20%;
- scenario: store for 2 months.

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
- `assets/concepts/harvestwise-dashboard-concept.png`

## Suggested Next Steps

Most valuable next work:

1. Work through `docs/demo-polish-journal.md`, starting with visible Gemma status and empty demo actions.
2. Polish the demo flow for judges: make interview -> form update -> scenario -> advisor note feel obvious.
3. Add a tiny sample-plan loader so judges can start without typing.
4. Improve the README with screenshots and a judging-focused demo script.
5. Add deployment instructions or deploy to Vercel/Render if the user asks.
6. If a real Gemma key is available, verify live model responses end to end.

## Style Notes

The user prefers Russian communication.

The code should stay clean and scalable:

- keep domain math pure and testable;
- keep Gemma prompts isolated server-side;
- keep UI components reusable;
- avoid mixing AI output with authoritative financial calculations;
- preserve fallback behavior so the demo works without API credentials.
