# Next Session Roadmap

The U.S. Midwest baseline is now live. The next session should extend the post-plan experience without weakening the deterministic finance boundary.

## 1. Post-plan dashboard

Build a compact dashboard after the first calculation with:

- **Price safety:** current price, break-even price, downside room, and a clear safe/watch/risk state.
- **Cost drivers:** ranked contribution of seed, fertilizer, fieldwork/equipment, land lease, hauling, and storage.
- **Scenario comparison:** side-by-side baseline vs. one or more what-if scenarios, with the changed assumptions called out.

Keep the first-run form focused. These views belong after the farmer has created a plan.

## 2. Gemma guided interview + reality check + action pack

Extend Gemma from extraction into a guided workflow:

1. Ask only for the next missing or uncertain assumption.
2. Summarize the captured plan in plain language.
3. Run a **reality check** that flags assumptions to verify locally: lease, input quotes, yield history, buyer price, and timing.
4. Produce an **action pack** containing the deterministic recommendation, the top assumptions to verify, and the next three practical steps.

Gemma may ask, structure, explain, and prioritize verification. TypeScript remains the authority for cost, revenue, risk, scenario math, and the recommended action.

## 3. USDA Market Pulse with provenance and manual apply

Add an optional market panel that shows a USDA Market News observation with:

- commodity and contract/report;
- location, grade, and unit;
- observed price;
- source/report name;
- timestamp and freshness state.

The farmer must explicitly click **Apply to plan**. Never silently replace a user-entered market price. If the observation is stale, missing, or not comparable to the selected crop/location, show that limitation instead of presenting false precision.

## 4. Optional NWS weather and alerts

Only add this after the dashboard and Market Pulse are solid. Start with a small, location-aware card for relevant NWS forecast or alerts, including source and timestamp. Weather should inform timing and verification prompts, not alter financial calculations automatically.

## Suggested order of work

1. Post-plan dashboard and scenario comparison.
2. Gemma guided interview, reality check, and action pack.
3. USDA Market Pulse with provenance and explicit apply.
4. Optional NWS weather/alerts.

## Definition of done

- Every live external observation has source, location, unit, and timestamp.
- External data never overwrites user inputs without an explicit action.
- Gemma output is labelled separately from local fallback output.
- All financial values and actions still come from deterministic domain code.
- The full `Plan → Dashboard → Ask Gemma → Verify/Apply` path works on desktop and mobile.
