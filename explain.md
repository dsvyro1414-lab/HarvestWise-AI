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

The demo has four main screens:

1. Farm Plan
   - The user enters crop, land, costs, expected harvest, and market price.
   - The app shows expected profit, break-even price, risk, and recommendation.

2. Compare Crops
   - The user compares two crops, such as maize vs cassava.
   - The app shows which crop is cheaper to start, which is more profitable, and which is safer.

3. Market Decision
   - The user compares selling now, storing the crop, or transporting it to another market.
   - The app shows which option gives the best net return.

4. Advisor Notes
   - Gemma generates a simple explanation for the farmer.
   - It also creates a short WhatsApp-style message that a cooperative or extension officer can send.

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
