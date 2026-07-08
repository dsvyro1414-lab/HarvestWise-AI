import express from "express";
import { buildAdvisorNotes } from "./gemmaAdvisor";
import { extractFarmInterview, parseScenarioQuestion } from "./gemmaStructured";
import { adviceRequestSchema, farmInterviewRequestSchema, scenarioRequestSchema } from "./validation";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "harvestwise-ai-api",
  });
});

app.post("/api/advice", async (request, response) => {
  const parsed = adviceRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      error: "Invalid advice request",
      issues: parsed.error.flatten(),
    });
    return;
  }

  const advice = await buildAdvisorNotes(parsed.data);
  response.json(advice);
});

app.post("/api/interview", async (request, response) => {
  const parsed = farmInterviewRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      error: "Invalid farm interview request",
      issues: parsed.error.flatten(),
    });
    return;
  }

  const result = await extractFarmInterview(parsed.data);
  response.json(result);
});

app.post("/api/scenario", async (request, response) => {
  const parsed = scenarioRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({
      error: "Invalid scenario request",
      issues: parsed.error.flatten(),
    });
    return;
  }

  const result = await parseScenarioQuestion(parsed.data);
  response.json(result);
});

app.listen(port, () => {
  console.log(`HarvestWise AI API running on http://localhost:${port}`);
});
