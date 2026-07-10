# HarvestWise AI

## Main Idea

HarvestWise AI is an AI farm profit planner for smallholder farmers.

It helps a farmer answer one simple question before the season starts:

> What should I do next with this farm plan?

The product combines agriculture and finance without becoming a loan or banking product. Instead of telling farmers how to borrow money, HarvestWise AI helps them understand what to plant, how much it will cost, when they may recover their money, and which decision is safer.

## The Problem

Many small farmers make planting and selling decisions without a clear financial picture.

They may know how to grow crops, but they often do not know:

- how much the season will really cost;
- what price they need to break even;
- whether one crop is more profitable than another;
- whether they should sell immediately or wait;
- how transport, storage, fertilizer, and labor costs affect profit;
- what happens if market prices drop.

Because of this, a farmer can work hard for an entire season and still lose money.

## The Solution

HarvestWise AI turns simple farm information into a clear profit plan.

A farmer, cooperative worker, or agriculture advisor enters basic details:

- crop type;
- land size;
- available budget;
- seed cost;
- fertilizer cost;
- labor cost;
- expected harvest;
- expected market price;
- transport cost;
- storage option.

HarvestWise AI then calculates:

- expected profit;
- total season cost;
- break-even price;
- risk level;
- cashflow timeline;
- one deterministic recommended next action with calculated reasons.

Then Gemma explains the result in simple language, so the farmer can understand the decision without asking AI to make it.

## Example

A farmer has 2 acres of land and is deciding between maize and cassava.

HarvestWise AI can show:

- maize may bring money faster but has higher input-cost risk;
- cassava may be safer but takes longer to return cash;
- the farmer needs a market price above a certain amount to avoid losing money;
- if fertilizer prices rise or market prices fall, the profit can disappear.

Instead of giving a generic answer, HarvestWise AI gives a practical, deterministic recommendation:

> Plant maize only if input costs stay below this amount. If the market price drops by 15%, cassava becomes the safer option.

## What Judges Will See

HarvestWise AI should look like a real working product, not just a chatbot.

The current demo makes the farmer decision clear before exposing deeper analysis:

1. Recommended Next Action
   - The user sees one action such as `Plant this plan`, `Reduce acreage before planting`, or `Do not plant yet`.
   - Two calculated reasons make the decision auditable.

2. Core Assumptions and Plan Snapshot
   - The user enters crop, land, available budget, expected harvest, and market price.
   - The app shows expected profit, break-even price, and cash status.

3. Optional Expert Detail
   - Price sensitivity, crop comparison, harvest-market options, and scenario testing are available only when the judge wants to investigate.

4. Scenario Mode
   - The advisor asks what-if questions such as fertilizer cost rising or storage time changing.
   - Gemma maps the question into structured changes, and deterministic code recalculates the result.

5. Gemma Explains the Plan
   - Gemma extracts a farm note, interprets a scenario, or explains the deterministic result.
   - The UI explicitly states that Gemma does not calculate profit or choose the recommendation.

## Current Visual Direction

The app now follows the HarvestWise AI reference brand:

- clean three-leaf logo mark;
- `HarvestWise AI` wordmark treatment in the topbar;
- tagline: `Plan the season. Know the next step.`;
- palette: deep green, muted green, sage, cream, and near-black;
- focused layout with action and compact metrics first, then on-demand details and an optional explanation panel.

## Recommended Live Demo Path

1. Open the dashboard with the default maize plan and point to **Recommended next action**.
2. Change market price or budget and show that the deterministic action changes with it.
3. Open a scenario such as `what if fertilizer cost rises by 20%?`.
4. Show how Gemma interprets the requested parameter change and HarvestWise recalculates locally.
5. Ask Gemma for an explanation or create the WhatsApp draft; state that it cannot choose the action.

## Where Gemma Fits

Gemma is used as the structured-language and explanation layer.

The financial calculations should be handled by normal code so that the numbers are reliable. Gemma should then help with:

- explaining the supplied numbers in simple language;
- turning messy farmer answers into structured farm data;
- converting scenario questions into typed parameter operations;
- creating advisor notes for cooperatives or extension officers;
- translating or simplifying financial terms.

Gemma never calculates financial outputs or chooses, replaces, or rewords the recommended action. This makes Gemma useful without making financial truth dependent on model text.

## Why This Is Strong For The Hackathon

HarvestWise AI is strong because it connects agriculture and finance in a practical way.

It is not a generic agriculture chatbot. It solves a specific problem:

> helping farmers avoid unprofitable seasons before they spend money.

The idea is easy for judges to understand, but still meaningful:

- it supports small farmers;
- it improves financial decision-making;
- it can be used by farmers, cooperatives, and agriculture advisors;
- it can scale to many crops and regions;
- it demonstrates a clear use of Gemma;
- it can be shown in a polished demo without needing bank integrations or real-time market APIs.

## Short Pitch

HarvestWise AI helps small farmers make profitable planting and selling decisions before they lose money.

Farmers enter simple details about their land, costs, harvest, and market price. The app calculates profit, break-even price, risk, and a recommended next action. Gemma then explains that deterministic plan in simple language for the farmer or cooperative advisor.

## One-Sentence Version

HarvestWise AI is a Gemma-powered profit planner that helps small farmers decide what to plant, when to sell, and how to avoid losing money.
