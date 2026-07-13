# HarvestWise AI

## Main idea

HarvestWise AI is a Gemma-powered farm profit planner for independent U.S. Midwest grain farmers and cooperative or extension advisors.

It answers one practical question before money is committed:

> What should I do next with this farm plan?

The product is not a loan, credit-scoring, or autonomous farm-management system. It calculates an editable season plan, exposes the assumptions that matter, and uses Gemma only to understand or explain language around those calculations.

## The problem

A planting decision depends on market price, yield, seed, fertilizer, fieldwork, land lease, hauling, storage, and available cash. These assumptions can look reasonable individually while the combined plan has almost no margin.

A generic AI answer is not enough. Financial numbers and the recommended action must remain reproducible, testable, and independent of model wording.

## The solution

A farmer or advisor enters:

- crop;
- land size;
- available budget;
- expected yield;
- market price;
- optional detailed costs, storage assumptions, and price-source evidence.

HarvestWise then calculates:

- expected revenue and entered costs;
- expected profit and margin;
- entered-cost break-even price;
- budget gap or cash buffer;
- price sensitivity and market options;
- one deterministic recommended next action with calculated reasons.

Gemma can extract those assumptions from a farm note, interpret a what-if question, or explain the already-calculated result. It never becomes the source of finance, risk, or the action.

## Current worked example

The prepared judge example is Corn on 40 acres with a `$35,000` budget, `220 bu/acre` expected yield, and a `$4.05/bu` entered market price.

HarvestWise calculates:

- expected production: `8,800 bushels`;
- expected revenue: `$35,640`;
- modeled season cost: `$33,200`;
- expected profit: `$2,440`;
- entered-cost break-even: `$3.77/bu`;
- cash position: `$1,800` buffer;
- action: **Plant this plan**.

When the user asks `fertilizer cost rises by 20%`, Gemma converts the sentence into a typed fertilizer operation. HarvestWise adds `$1,680` to modeled cost and recalculates expected profit to `$760`. The original `$2,440` baseline stays unchanged.

## What judges see

1. **Plan**
   - Crop plus four personal inputs create the first plan.
   - Optional price evidence records where the entered market price came from.

2. **Results**
   - The deterministic action appears before deeper analysis.
   - Profit, entered-cost break-even, cash position, price safety, and cost drivers remain auditable.
   - A Gemma-interpreted scenario produces a local before/after calculation.
   - A reality check turns assumptions into practical calls and quotes to verify.
   - The Decision Pack creates a shareable field review.

3. **Ask Gemma**
   - Gemma explains the plan or prepares sharing language.
   - The interface states that HarvestWise, not Gemma, owns every financial decision.

## Recommended 60-75 second demo

1. Enter Corn, `40 acres`, `$35,000`, `220 bu/acre`, and `$4.05/bu`.
2. Show **Plant this plan**, `$2,440` expected profit, and `$3.77/bu` entered-cost break-even.
3. Run `fertilizer cost rises by 20%`.
4. Show `Gemma interpreted the change` and `$2,440 -> $760`.
5. Open the Decision Pack and point out that the baseline and scenario are recorded separately.
6. State: **Gemma explains; HarvestWise calculates.**

Price details, crop comparison, market options, weather, and Advisor are Q&A extensions. Advisor should only be used after a live-provider preflight because it may return a clearly labelled local fallback.

## Where Gemma fits

Gemma is the structured-language and explanation layer:

- natural-language farm note -> validated plan patch;
- what-if question -> validated typed operations;
- deterministic plan -> concise explanation or sharing text.

Normal TypeScript calculates revenue, cost, break-even, risk context, scenario results, and the recommended action. Server-provided patches are rebuilt from validated operations before local calculation, and every scenario starts from the immutable baseline.

## Trust and limitations

- HarvestWise is a planning prototype, not agronomic, legal, investment, or financial advice.
- The entered market price is not a live quote; the farmer must confirm it locally.
- The financial model excludes insurance, debt service, taxes, complete machinery and overhead costs, and government payments.
- `$3.77/bu` is an entered-cost break-even, not a full economic break-even.
- Risk bands are planning heuristics and have not been externally calibrated.
- Current crop and optional weather coverage is limited.
- Live Gemma requests send the submitted note or question and relevant plan context to the configured Google GenAI service; sensitive personal or financial identifiers should not be entered.
- Farmer or advisor interviews are still required before claiming field validation.
- Any model fallback is labelled as local and must never be presented as Gemma output.

## Why the project is strong for the hackathon

HarvestWise is not a chatbot wrapped around a calculator. It demonstrates a responsible division of work:

- a real community problem with an immediately understandable decision;
- deterministic and testable financial truth;
- Gemma used where language intelligence materially improves the workflow;
- a visible stress test that proves AI value without handing the model financial authority;
- a field-ready artifact instead of a dashboard-only ending;
- honest provenance, limitations, and fallback behavior.

## Short pitch

HarvestWise AI helps an independent grain farmer see whether a season plan still works before committing money. The farmer enters a few local assumptions, HarvestWise calculates the action and financial limits, and Gemma turns ordinary farm language into safe structured scenarios and clear explanations.
