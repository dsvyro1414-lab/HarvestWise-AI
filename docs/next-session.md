# Next Session Roadmap

The U.S. Midwest baseline, post-plan dashboard, guided reality check/action pack, USDA Market Pulse, and NWS weather context are implemented. The agreed product roadmap is complete; choose a new priority before expanding scope.

## NWS weather and alerts

The weather panel is an optional, explicit lookup for a farmer-selected Midwest location.

- It starts with a farmer-selected location rather than inferred coordinates.
- It shows the NWS forecast/active alert, source, location, temperature unit, timestamp, and freshness state.
- It turns the observation into a plain timing prompt for fieldwork, hauling, or verification.
- It never changes cost, revenue, risk, scenario calculations, or the deterministic recommended action.
- A missing/stale/non-matching observation is shown as a limitation, never as a forecast.

## Existing foundations

### Post-plan dashboard

- **Price safety:** current price, break-even price, downside room, and safe/watch/risk state.
- **Cost drivers:** ranked seed, fertilizer, fieldwork/equipment, land lease, hauling, and storage contribution.
- **Scenario comparison:** baseline vs. the latest what-if, including changed assumptions.

### Gemma guided workflow + action pack

- Gemma extracts a note or scenario operation; local TypeScript remains authoritative for calculations and actions.
- The action pack identifies lease, input quotes, yield history, buyer price, and timing checks, then offers a Gemma wording for the top verification question.

### USDA Market Pulse

- Uses the USDA AMS MyMarketNews Illinois Grain Bids report only after an explicit farmer request.
- Shows commodity, grade, unit, contract, location, report/source, timestamp, freshness, and limitation.
- Applies an observed cash-bid price only after **Apply to plan**; stale observations cannot be applied.
- Requires server-side `USDA_MARKET_NEWS_API_KEY`; without it, the UI reports the unavailable state and does not change the plan price.

## Definition of done

- Every live external observation has source, location, unit, and timestamp.
- External data never overwrites user inputs without an explicit action.
- Gemma output is labelled separately from local fallback output.
- All financial values and actions still come from deterministic domain code.
- The full `Plan → Dashboard → Ask Gemma → Verify/Apply` path works on desktop and mobile.
