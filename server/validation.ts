import { z } from "zod";

export const farmPlanInputSchema = z.object({
  cropId: z.enum(["maize", "cassava", "rice", "tomato", "beans"]),
  landSizeAcres: z.number().min(0),
  availableBudget: z.number().min(0),
  seedCostPerAcre: z.number().min(0),
  fertilizerCostPerAcre: z.number().min(0),
  laborCostPerAcre: z.number().min(0),
  expectedHarvestPerAcre: z.number().min(0),
  marketPricePerUnit: z.number().min(0),
  transportCost: z.number().min(0),
  storageMonths: z.number().min(0).max(12),
  storageCostPerMonth: z.number().min(0),
  expectedMonthlyPriceGrowth: z.number().min(0).max(1),
});

export const adviceRequestSchema = z.object({
  input: farmPlanInputSchema,
  mode: z.enum(["explain", "whatsapp"]).default("explain"),
  question: z.string().trim().max(500).optional(),
});

export const farmInterviewRequestSchema = z.object({
  text: z.string().trim().min(5).max(2000),
  currentInput: farmPlanInputSchema,
});

export const scenarioRequestSchema = z.object({
  question: z.string().trim().min(3).max(1000),
  currentInput: farmPlanInputSchema,
});
