import type { FarmPlanInput, FarmPlanResult } from "./types.js";

export type PriceSafetyState = "safe" | "watch" | "risk";

export interface PriceSafety {
  state: PriceSafetyState;
  currentPrice: number;
  breakEvenPrice: number;
  downsideRoom: number;
  downsideRoomPercent: number;
}

export interface CostDriver {
  id: "seed" | "fertilizer" | "fieldwork" | "lease" | "hauling" | "storage";
  label: string;
  amount: number;
  share: number;
}

/**
 * Classifies only the buffer between the entered price and the deterministic
 * break-even price. It intentionally does not change the plan's broader risk score.
 */
export function buildPriceSafety(input: FarmPlanInput, plan: FarmPlanResult): PriceSafety {
  const currentPrice = positive(input.marketPricePerUnit);
  const breakEvenPrice = positive(plan.breakEvenPrice);
  const downsideRoom = currentPrice - breakEvenPrice;
  const downsideRoomPercent = downsideRoom / Math.max(currentPrice, 1);
  const state: PriceSafetyState = downsideRoom <= 0 ? "risk" : downsideRoomPercent < 0.15 ? "watch" : "safe";

  return {
    state,
    currentPrice,
    breakEvenPrice,
    downsideRoom,
    downsideRoomPercent,
  };
}

/**
 * Makes the six user-entered cost categories visible without altering the
 * season-cost calculation in finance.ts.
 */
export function buildCostDrivers(input: FarmPlanInput, plan: FarmPlanResult): CostDriver[] {
  const acres = positive(input.landSizeAcres);
  const totalCost = Math.max(positive(plan.totalSeasonCost), 1);
  const drivers: Omit<CostDriver, "share">[] = [
    { id: "seed", label: "Seed", amount: acres * positive(input.seedCostPerAcre) },
    { id: "fertilizer", label: "Fertilizer", amount: acres * positive(input.fertilizerCostPerAcre) },
    { id: "fieldwork", label: "Fieldwork & equipment", amount: acres * positive(input.laborCostPerAcre) },
    { id: "lease", label: "Land lease", amount: acres * positive(input.landLeaseCostPerAcre) },
    { id: "hauling", label: "Hauling", amount: positive(input.transportCost) },
    { id: "storage", label: "Storage", amount: positive(input.storageMonths) * positive(input.storageCostPerMonth) },
  ];

  return drivers
    .map((driver) => ({ ...driver, share: driver.amount / totalCost }))
    .sort((left, right) => right.amount - left.amount);
}

function positive(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}
