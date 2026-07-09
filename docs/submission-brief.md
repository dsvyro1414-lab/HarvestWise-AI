# HarvestWise AI Submission Brief

## One-Liner

HarvestWise AI is a Gemma-powered profit planner that helps small farmers decide what to plant, when to sell, and how to avoid losing money.

## Problem

Smallholder farmers often make planting and selling decisions without a clear financial picture. They may understand farming, but still lose money because fertilizer, labor, transport, storage, and market price changes are hard to reason about together.

## Solution

HarvestWise AI turns simple farm assumptions into a clear season plan:

- one recommended next action with 2–3 calculated reasons;
- expected profit;
- break-even price;
- total season cost;
- crop comparison;
- market decision;
- risk explanation;
- WhatsApp-ready farmer advice.

## Why Gemma

The product does not ask Gemma to perform exact arithmetic or choose an action. The app handles calculations and the recommended next step with deterministic code. Gemma is used where language models are strongest:

- explaining financial results in simple language;
- translating a farm note into structured assumptions;
- translating a what-if question into safe parameter operations;
- answering advisor questions;
- generating a short WhatsApp explanation;
- helping cooperative workers communicate the already-calculated risk and action clearly.

## Demo Story

1. A cooperative advisor enters a maize season plan for a farmer.
2. HarvestWise AI instantly shows one recommended next action, its calculated reasons, and a compact profit snapshot.
3. The advisor changes price or budget to prove that the action updates deterministically.
4. The advisor opens crop, price, and harvest-market details only when deeper analysis is needed.
5. Gemma explains the result or turns a natural-language question into structured inputs; it cannot choose the action.

## Current Demo Surface

The current polished build presents the judge flow in one focused workspace:

- left rail: the five core assumptions, with costs and interview import available on demand;
- center board: the recommended next action first, then a compact profit snapshot;
- expandable details: scenario testing, crop comparison, price sensitivity, and harvest-market options;
- right rail: an optional Gemma explanation panel that states its deterministic boundary.

The final brand uses the HarvestWise AI leaf mark, the tagline `Plan the season. Know the next step.`, and the reference palette: deep green, muted green, sage, cream, and near-black.

## Deeper Gemma Integration

HarvestWise AI uses Gemma in three practical ways:

1. Farm interview copilot
   - The farmer describes the season in normal text.
   - Gemma extracts crop, land size, budget, input costs, expected harvest, and market price.
   - The app updates the form and recalculates the plan.

2. Scenario mode
   - The advisor asks what-if questions such as "what if fertilizer cost rises by 20%?"
   - Gemma converts the question into structured parameter operations.
   - The deterministic finance engine applies the operations and recalculates profit, break-even, risk, and market decisions.

3. Advisor explanation
   - Gemma explains the deterministic plan and action in farmer-friendly language.
   - It generates a concise WhatsApp explanation for field use.

Gemma returns schema-constrained JSON for extraction, scenarios, and explanation. It never calculates financial outputs or chooses, replaces, or rewords the recommended action.

## Why It Can Scale

HarvestWise AI starts with a few crops and Nigeria-oriented assumptions, but the architecture can expand to:

- more crops;
- regional cost profiles;
- local languages;
- cooperative dashboards;
- market price integrations;
- offline-first mobile workflows.
