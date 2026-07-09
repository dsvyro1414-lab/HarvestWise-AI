# HarvestWise AI

## Main Idea

HarvestWise AI is an AI farm profit planner for smallholder farmers.

It helps a farmer answer one simple question before the season starts:

> Can this farm season make money?

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
- best next action.

Then Gemma explains the result in simple language, so the farmer can actually understand the decision.

## Example

A farmer has 2 acres of land and is deciding between maize and cassava.

HarvestWise AI can show:

- maize may bring money faster but has higher input-cost risk;
- cassava may be safer but takes longer to return cash;
- the farmer needs a market price above a certain amount to avoid losing money;
- if fertilizer prices rise or market prices fall, the profit can disappear.

Instead of giving a generic answer, HarvestWise AI gives a practical recommendation:

> Plant maize only if input costs stay below this amount. If the market price drops by 15%, cassava becomes the safer option.

## What Judges Will See

HarvestWise AI should look like a real working product, not just a chatbot.

The current polished demo uses one focused dashboard instead of separate pages. Judges see the full workflow at once:

1. Farm Assumptions
   - The user enters crop, land, costs, expected harvest, and market price.

2. Profit Analysis
   - The app shows expected profit, break-even price, ROI, cash status, risk, and a market-price sensitivity chart.

3. Scenario Mode
   - The advisor asks what-if questions such as fertilizer cost rising or storage time changing.
   - Gemma maps the question into structured changes, and deterministic code recalculates the result.

4. Crop And Market Comparison
   - The user compares crop options such as maize, cassava, rice, tomato, and beans.
   - The user compares selling now, storing short-term, or storing longer.
   - The app shows which option gives the best net return.

5. Advisor Notes
   - Gemma generates a simple explanation for the farmer.
   - It also creates a short WhatsApp-style message that a cooperative or extension officer can send.

## Current Visual Direction

The app now follows the HarvestWise AI reference brand:

- clean three-leaf logo mark;
- `HarvestWise AI` wordmark treatment in the topbar;
- tagline: `Smarter yields. Better future.`;
- palette: deep green, muted green, sage, cream, and near-black;
- compact dashboard layout with assumptions on the left, analysis in the middle, and decisions/advice on the right.

## Recommended Live Demo Path

1. Open the dashboard with the default maize plan.
2. Show the deterministic profit snapshot and explain that Gemma does not calculate the financial outputs.
3. Ask a scenario such as `what if fertilizer cost rises by 20%?`.
4. Show how the plan recalculates and how the best market move changes if needed.
5. Ask Gemma for an explanation or refresh the WhatsApp draft for a farmer-facing message.

## Where Gemma Fits

Gemma is used as the reasoning and explanation layer.

The financial calculations should be handled by normal code so that the numbers are reliable. Gemma should then help with:

- explaining the numbers in simple language;
- asking follow-up questions;
- turning messy farmer answers into structured farm data;
- comparing options in plain English;
- generating advice for farmers;
- creating advisor notes for cooperatives or extension officers;
- translating or simplifying financial terms.

This makes Gemma useful without depending on it for exact arithmetic.

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

Farmers enter simple details about their land, costs, harvest, and market price. The app calculates profit, break-even price, risk, and cashflow. Gemma then explains the plan in simple language and generates practical advice for the farmer or cooperative advisor.

## One-Sentence Version

HarvestWise AI is a Gemma-powered profit planner that helps small farmers decide what to plant, when to sell, and how to avoid losing money.
