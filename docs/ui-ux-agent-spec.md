# HarvestWise AI — UI/UX Task Specification for Coding Agent

## Task goal

Make the current HarvestWise AI interface easier for a real farmer to understand without changing the financial model, AI boundary, or product flow.

The interface should remain calm, trustworthy, and green, but become less technical and less visually equalized. A user should understand the recommended next action before encountering secondary analysis.

Primary product promise:

> Gemma explains. HarvestWise calculates.

## Scope

Implement only these four areas:

1. Simplify user-facing language.
2. Strengthen the “What should I do now?” action card.
3. Create a clearer hierarchy between primary and secondary sections.
4. Preserve the calm green visual system and make AI provenance unmistakable.

Do not change:

- finance formulas or risk calculations;
- crop defaults or crop catalog;
- `src/domain/finance.ts` behavior;
- `src/domain/farmerAction.ts` decision rules;
- Gemma prompts or model selection;
- API contracts;
- scenario patch semantics;
- the existing local fallback behavior;
- the U.S. Midwest, USD, acres, or bushels baseline.

## Product context

HarvestWise is a farm-season planning tool for an independent U.S. Midwest grain farmer and a cooperative or extension advisor.

The user needs to answer one question quickly:

> What should I do next before committing money?

The current primary flow is:

```text
Plan → Results → Ask Gemma
```

Keep this flow. Improve its hierarchy and language instead of replacing it with a new dashboard or modal workflow.

## Target experience

After the user creates a plan, the first visible result should communicate:

1. the recommended action;
2. why that action was selected;
3. the three numbers needed to judge the plan;
4. one obvious way to test a change.

Everything else should remain available, but should feel optional.

Success criteria for a first-time user:

- Within 10 seconds, the user can answer “What should I do now?”
- The user can distinguish calculated numbers from AI wording.
- The user does not need to understand financial jargon to use the first result.
- Only one primary next interaction competes for attention at a time.

## 1. Simplify user-facing language

The product UI is intentionally in English because the current demo targets U.S. Midwest farmers and judges. Use plain, direct, farmer-friendly English. Do not translate the interface into Russian as part of this task.

### Copy replacements

Use these visible labels or close equivalents:

| Current wording | Preferred wording | Notes |
| --- | --- | --- |
| Downside room | How far can the price fall? | Explain the concept, not the finance term. |
| Cash status | Money left after costs | Keep the amount prominent. |
| Break-even price | Price where you stop losing | The exact value can still use “break-even” in helper text. |
| Price evidence | Where did this price come from? | Ask a practical question. |
| Reality check | Check before you commit | Make the purpose obvious. |
| Action pack | Your next steps | Avoid internal product terminology. |
| Scenario comparison | What changes if…? | Use the farmer’s question as the mental model. |
| Market price record | Price used in this plan | Keep source and date below it. |
| NWS weather & alerts | Weather timing check | Explain that it is for timing only. |
| Optional timing context | Check the timing | Reduce abstraction. |
| Cost drivers | Where the money goes | Keep category names below. |
| Farm details | Tell us about your farm | Prefer the task over the data structure. |
| Expected harvest | Expected harvest per acre | Keep the unit visible beside the field. |
| Market price | Price you expect to receive | Add the unit, for example USD/bu. |
| Explain with Gemma | Explain this plan | Keep “Gemma” in the section heading and provenance label. |
| Local fallback answer | Local explanation, Gemma unavailable | Be explicit but not alarming. |

### Copy rules

- Prefer one short sentence over a label plus an abstract noun.
- Avoid unexplained terms such as “downside”, “volatility”, “evidence”, “context”, and “drivers” in the primary path.
- Keep exact units visible: `USD/bu`, `acres`, `bushels/acre`.
- Use concrete verbs: `Check`, `Compare`, `Confirm`, `Test`, `Share`.
- Do not promise certainty about prices, weather, or profit.
- Do not add claims such as “AI verified”, “AI recommended”, or “guaranteed”.

### Input helper text

Where space allows, add concise examples or helper text:

- Land: `Example: 40`
- Available budget: `Money you can use this season`
- Expected harvest: `Bushels per acre`
- Price: `Your local buyer or elevator price`

Do not add long explanations below every field. Use one short helper line or the existing placeholder.

## 2. Strengthen the “What should I do now?” card

The current `Recommended next action` card is the most important decision surface. Make it the visual and semantic anchor of the Results section.

### Required structure

Use this structure or a close equivalent:

```text
WHAT SHOULD I DO NOW?

Plant this plan

Expected profit is $2,440, and the plan stays within your budget.
It remains profitable above $3.77/bu.

Before planting

Calculated by HarvestWise from your numbers.
```

The action title must continue to come from the deterministic `FarmerAction` object. Do not generate or rewrite it with Gemma.

### Card requirements

- Make the card visually dominant inside the Results section.
- Use a clear eyebrow such as `What should I do now?`.
- Show the action title at the largest text size in the result area.
- Show no more than two reasons in the default view.
- Show the stage, for example `Before planting` or `At harvest`.
- Keep the exact financial guardrail visible when one exists, such as break-even or storage threshold.
- Keep the trust line visible: `Calculated by HarvestWise, not generated by AI.`
- Preserve action variants: plant, reduce acreage, secure buyer, do not plant, store only above threshold.
- Use semantic tones: green for workable, amber for caution, red/brick for do not plant. Do not use color as the only status signal.
- Do not add a fake CTA that implies HarvestWise can plant, sell, call a buyer, or execute an external action.

### Action-specific tone

The card should feel reassuring when the plan is workable and direct when it is not.

- `Plant this plan`: calm, positive, evidence-led.
- `Reduce acreage before planting`: practical and non-judgmental.
- `Secure a buyer before planting`: protective, not alarmist.
- `Do not plant yet`: clear, prominent, and supported by the exact missing or negative condition.
- `Store only if price exceeds…`: explain the threshold in plain language.

## 3. Separate primary and secondary sections

The current page contains many useful sections, but they should not all have equal visual weight.

### Primary result stack

Keep these open and prominent after plan creation:

1. Recommended next action.
2. Three key metrics:
   - Expected profit;
   - Price where you stop losing;
   - Money left after costs or amount over budget.
3. A short risk explanation.
4. `What changes if…?` / `Test a change`.

The scenario composer should remain easy to find because it is the strongest AI demonstration, but it must remain visually subordinate to the deterministic action.

### Secondary analysis

Move these into progressive disclosure or clearly labelled secondary sections:

- price sensitivity chart;
- cost breakdown;
- price source record;
- weather timing check;
- local assumptions to verify;
- crop comparison;
- harvest market options.

Use the existing `<details>` pattern or an equivalent inline disclosure. Do not introduce a modal as the first solution.

Recommended grouping:

```text
Your plan at a glance
  Recommended action
  Key numbers
  Test a change

Explore the numbers
  Price sensitivity
  Where the money goes

Check before you commit
  Price used in this plan
  Weather timing check
  Your next steps

Compare and share
  Crop comparison
  Harvest market options
  Field-ready decision pack
```

### Decision Pack placement

Keep the Decision Pack available as a clear secondary action because it is valuable for a co-op or advisor handoff. It should not compete with the Recommended next action card.

Use a label such as:

> Share this plan with a buyer or advisor

### Ask Gemma placement

Keep `Ask Gemma` as step 3 at the end of the guided journey. It should explain the result, not appear to be the source of the result.

Keep this provenance statement visible:

> Gemma explains. HarvestWise calculates.

## 5. Preserve the calm green style and transparent AI communication

Do not replace the current visual identity with a generic dark AI dashboard, neon gradients, excessive glass effects, or animated decoration.

### Visual direction

- Preserve the cream, white, sage, and deep-green palette.
- Keep green for primary actions and positive calculated outcomes.
- Use amber for “check this” or “watch closely” states.
- Use brick/red only for loss, invalid, or do-not-plant states.
- Keep neutral surfaces for secondary analysis.
- Use typography, spacing, and placement to create hierarchy before adding more color.
- Reduce unnecessary borders or nested card treatments where possible.
- Keep the existing responsive behavior and narrow-screen layout.
- Do not add gradients, decorative AI particles, or prominent glow effects.

### AI provenance rules

Every AI-generated or AI-assisted surface must make its role clear:

- Farm note extraction: `Gemma filled these fields` or `Local extraction fallback`.
- Scenario interpretation: `Gemma interpreted the change` or `Local interpreter`.
- Advisor response: `Answered by Gemma` or `Local explanation, Gemma unavailable`.
- Reality-check wording: `Gemma wording` or `Local fallback wording`.

Financial outputs must use deterministic language:

- `Calculated by HarvestWise`;
- `HarvestWise recalculated this scenario`;
- `Financial results are based on your entered assumptions`.

Never label the Recommended next action as AI-generated. Never show a local fallback inside a Gemma-styled message without its fallback label.

### Loading and error language

Use human-readable status messages:

- `Reading your farm note…`
- `Turning your what-if into a calculation…`
- `Preparing an explanation…`
- `Gemma is unavailable. A local explanation is shown instead.`

Keep the existing elapsed-time feedback for longer Advisor requests. Do not imply that a request succeeded before a response is available.

## Files likely in scope

The coding agent may modify:

- `src/app/App.tsx` for section order and grouping;
- `src/features/farm-plan/FarmInputPanel.tsx` for input labels and helper text;
- `src/features/farm-plan/FarmerActionCard.tsx` for the primary action card;
- `src/features/farm-plan/ProfitSnapshot.tsx` for key metric labels and hierarchy;
- `src/features/post-plan/PostPlanDashboard.tsx` for primary versus secondary content;
- `src/features/farm-plan/ActionPackPanel.tsx` for `Your next steps` language;
- `src/features/market-pulse/MarketPulsePanel.tsx` for price-record copy;
- `src/features/weather/WeatherContextPanel.tsx` for timing-check copy;
- `src/features/decision-pack/DecisionPackPanel.tsx` for share-oriented labeling;
- `src/features/advisor/AdvisorPanel.tsx` for clear AI/fallback wording;
- `src/styles/global.css` for hierarchy, spacing, semantic states, and responsive layout.

Do not modify domain calculations or server AI behavior for this task.

## Acceptance criteria

### UX and hierarchy

- A created plan shows the primary action before secondary analysis.
- The first result viewport contains the action, three key metrics, and a clear scenario entry point.
- Secondary features do not visually compete with the action card.
- The page still supports the full existing functionality without removing data.

### Copy

- Primary-path labels use plain language from this document or equivalent wording.
- Technical terms have either been replaced or explained in nearby helper text.
- The interface remains English and U.S.-oriented.

### AI transparency

- Gemma, local fallback, and deterministic HarvestWise calculations remain visibly distinct.
- The Recommended next action is still labelled as calculated by HarvestWise.
- No copy implies that Gemma approved, guaranteed, or financially recommended the plan.

### Visual quality

- Green visual identity remains intact.
- No decorative AI effects are introduced.
- Positive, warning, and negative states remain distinguishable without color alone.
- No horizontal overflow at 320 px or 390 px.
- Desktop layout remains balanced at approximately 1280–1440 px.

### Technical safety

- `npm test` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- The deterministic finance result for the prepared demo remains `$2,440`.
- The fertilizer `+20%` scenario remains `$2,440 → $760`.
- No API, model, prompt, or domain calculation changes are required.

## Suggested verification path

1. Open a clean page.
2. Create the prepared Corn plan:
   - 40 acres;
   - $35,000 budget;
   - 220 bu/acre;
   - $4.05/bu.
3. Confirm that `Plant this plan`, `$2,440`, and the price threshold are immediately understandable.
4. Run `fertilizer cost rises by 20%`.
5. Confirm that the scenario remains visually secondary to the calculated action.
6. Confirm the labels `Gemma interpreted the change` and `HarvestWise recalculated` remain clear.
7. Inspect the page at desktop width and at 320 px.
8. Capture a before/after screenshot if the hierarchy changed materially.

## Definition of done

The task is complete when the interface feels calmer and simpler without feeling less capable:

- a farmer can find the next action quickly;
- a judge can still see the AI value immediately;
- secondary tools remain available but no longer compete with the main decision;
- the green visual identity and deterministic AI boundary remain intact;
- all existing tests and demo numbers remain unchanged.
