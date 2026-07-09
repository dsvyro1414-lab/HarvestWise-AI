# HarvestWise AI

HarvestWise AI is a Gemma-powered farm profit planner for smallholder farmers and cooperative advisors.

The app helps answer a practical question before a farmer spends money:

> Can this farm season make money?

It keeps financial calculations deterministic in TypeScript, then uses Gemma to explain the plan in simple, farmer-friendly language.

## Current Status

The polished dashboard, HarvestWise AI logo, color palette, Vercel API routes, and simplified demo layout are now merged into `main`.

Latest pushed main commit:

```bash
18b8395 Refine brand logo and palette
```

## What It Does

- Builds a farm season budget from crop, land, input cost, harvest, and market price assumptions.
- Calculates expected profit, total cost, break-even price, ROI, budget gap, and risk level.
- Compares crop options such as maize, cassava, rice, tomato, and beans.
- Compares market decisions: sell at harvest, store short-term, or store longer.
- Generates advisor notes and WhatsApp-ready farmer guidance through a server-side Gemma endpoint.
- Extracts a farm plan from natural language through the farm interview copilot.
- Converts what-if questions into scenario parameter changes, then recalculates with deterministic code.
- Falls back to local advice if no API key is configured, so the demo remains usable.
- Presents the core judge flow in a single dashboard: assumptions, profit chart, scenario mode, market decision, and advisor guidance.

## Tech Stack

- React + TypeScript + Vite
- Express API server
- Vercel serverless API entrypoints in `api`
- Vitest for domain tests
- `@google/genai` for Gemma/Gemini API access
- Clean domain/UI separation for scaling

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Demo Path

Recommended 60-90 second judge flow:

1. Start on the dashboard and show the maize assumptions on the left.
2. Point to the deterministic profit snapshot: expected profit, break-even price, ROI, cash status, and risk.
3. Use Scenario Mode with a question such as `what if fertilizer cost rises by 20%?`.
4. Show the market decision rail and the recommended best move.
5. Open the advisor panel and ask Gemma to explain the result or generate the WhatsApp draft.

## Optional Gemma Setup

Create `.env` from `.env.example` and set:

```bash
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-3-27b-it
```

Without a key, HarvestWise AI uses a local deterministic explanation fallback.

## Quality Checks

```bash
npm test
npm run build
```

## Project Shape

- `src/domain` contains pure agriculture-finance calculations.
- `src/features` contains product feature UI.
- `src/components` contains shared layout and UI primitives.
- `src/services` contains client API calls.
- `server` contains the Gemma advice endpoint.
- `server/gemmaStructured.ts` contains the structured Gemma integration for farm interviews and scenarios.
- `api` contains Vercel-compatible API entrypoints for advice, interview extraction, scenarios, and health checks.
- `public/favicon.svg` contains the final HarvestWise AI mark.
- `assets/concepts` contains the generated UI concept used as the visual reference.
- `docs/demo-polish-journal.md` tracks demo-readiness issues and completed polish work.

## Session Context

Read `CONTEXT.md` first when continuing this project in a new Codex session.

## AI Boundary

Gemma is intentionally not used for financial math.

- Gemma extracts fields from natural language.
- Gemma maps scenario questions to parameter operations.
- Gemma explains deterministic results.
- `src/domain` applies patches, runs what-if operations, and calculates all finance outputs.
