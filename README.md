# HarvestWise AI

HarvestWise AI is a Gemma-powered farm profit planner for smallholder farmers and cooperative advisors.

The app helps answer a practical question before a farmer spends money:

> What should I do next?

It keeps financial calculations deterministic in TypeScript, then uses Gemma to explain the plan in simple, farmer-friendly language.

## Current Status

The production demo is built around a guided farmer flow, deterministic finance, and a server-side Gemma explanation layer.

Latest production commit:

```bash
01ab717 Make HarvestWise ready for real user input
```

Production demo: [harvestwise-ai.vercel.app](https://harvestwise-ai.vercel.app)

## What It Does

- Builds a farm season budget from crop, land, input cost, harvest, and market price assumptions.
- Opens with an empty personal plan: results remain hidden until the farmer enters the four required numbers and creates the plan.
- Calculates expected profit, total cost, break-even price, ROI, budget gap, and risk level.
- Shows one deterministic **Recommended next action** with two concrete reasons: plant, reduce acreage, secure a buyer, wait, or store only above a calculated price.
- Uses a U.S. Midwest baseline with corn, soybeans, and wheat; money is USD and field-crop yields are bushels per acre.
- Includes land lease as a separate cost so a plan does not overstate profitability by omitting access to the field.
- Compares market decisions: sell at harvest, store short-term, or store longer.
- Generates a plain-language explanation and WhatsApp draft through a server-side Gemma endpoint.
- Supports follow-up Gemma questions with recent conversation context, while keeping every financial decision deterministic.
- Extracts a farm plan from natural language through the farm interview copilot.
- Converts what-if questions into scenario parameter changes, then recalculates with deterministic code.
- Falls back to local advice if no API key is configured, so the demo remains usable.
- Keeps the farmer journey focused: core assumptions, one recommended action, and a compact plan snapshot. Scenario testing, crop comparison, price sensitivity, and market options are available on demand.

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

1. Open the app and show that no result is prefilled for the visitor.
2. Enter crop, land, available budget, expected harvest, and market price, then create the plan.
3. Point to **Recommended next action** and its two calculated reasons.
4. Ask Gemma why that action was selected, then ask one follow-up question in the same conversation.
5. Open **Test a change to this plan** and ask `what if fertilizer cost rises by 20%?`.
6. Open price, crop, or market details only if the judge wants to investigate the calculation.

## U.S. Baseline

The current product defaults are Midwest grain benchmarks, not live cash bids. They are deliberately editable and include seed, fertilizer, fieldwork/equipment, land lease, hauling, expected yield, and market price. See [U.S. baseline notes](docs/us-baseline.md) for sources, limits, and the path to an attributed USDA Market Pulse.

### Live Gemma Evidence

The production flow visibly separates model work from deterministic finance:

![Gemma interprets a fertilizer scenario and HarvestWise recalculates profit](docs/screenshots/gemma-scenario-proof.jpg)

Judge narration:

> Gemma turns farmer language into structured inputs and scenario operations. HarvestWise then recalculates every financial number and selects the recommended action in deterministic TypeScript.

## Optional Gemma Setup

Create `.env` from `.env.example` and set:

```bash
GEMINI_API_KEY=your_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
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
- Gemma cannot calculate, replace, or reword the recommended action.
- `src/domain` applies patches, runs what-if operations, and calculates all finance outputs.
