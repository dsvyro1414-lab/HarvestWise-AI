# HarvestWise AI Submission Brief

## One-Liner

HarvestWise AI is a Gemma-powered profit planner that helps small farmers decide what to plant, when to sell, and how to avoid losing money.

## Problem

Smallholder farmers often make planting and selling decisions without a clear financial picture. They may understand farming, but still lose money because fertilizer, labor, transport, storage, and market price changes are hard to reason about together.

## Solution

HarvestWise AI turns simple farm assumptions into a clear season plan:

- expected profit;
- break-even price;
- total season cost;
- crop comparison;
- market decision;
- risk explanation;
- farmer-ready message.

## Why Gemma

The product does not ask Gemma to perform exact arithmetic. The app handles calculations with deterministic code. Gemma is used where language models are strongest:

- explaining financial results in simple language;
- turning numbers into practical farmer guidance;
- answering advisor questions;
- generating short farmer messages;
- helping cooperative workers communicate risk clearly.

## Demo Story

1. A cooperative advisor opens the Balanced Iowa corn plan.
2. HarvestWise AI instantly shows profit, break-even price, risk, and best action.
3. The advisor switches to the Risky and Loss-making plans to show how the recommendation changes.
4. The advisor compares corn with soybeans, wheat, tomato, and dry beans.
5. Gemma explains the result and generates a message the advisor can send to the farmer.

## Current Demo Surface

The current polished build presents the whole judge flow in one dashboard:

- left rail: farm assumptions and optional interview import;
- center board: profit metrics, market-price sensitivity chart, scenario mode, and crop comparison;
- right rail: best market move and advisor notes;
- topbar: HarvestWise AI brand, section links, location, and season context.

The current brand uses the HarvestWise AI leaf mark, the tagline `US farm planning decisions.`, and the reference palette: deep green, muted green, sage, cream, and near-black.

## Deeper Gemma Integration

HarvestWise AI uses Gemma in three practical ways:

1. Farm interview copilot
   - The farmer describes the season in normal text.
   - Gemma extracts crop, land size, budget, input costs, expected harvest, and market price.
   - The app updates the form and recalculates the plan.

2. Scenario mode
   - The advisor asks what-if questions such as "what if corn price drops by 15%?"
   - Gemma converts the question into structured parameter operations.
   - The deterministic finance engine applies the operations and recalculates profit, break-even, risk, and market decisions.

3. Advisor explanation
   - Gemma explains the calculated plan in farmer-friendly language.
   - It generates concise farmer-facing advice for field use.

Gemma never calculates the financial outputs. It only extracts, structures, and explains.

## Why It Can Scale

HarvestWise AI starts with Iowa-oriented assumptions in USD, but the architecture can expand to:

- more crops;
- regional cost profiles;
- local languages;
- cooperative dashboards;
- market price integrations;
- offline-first mobile workflows.
