export default {
  fetch() {
    return Response.json({
      ok: true,
      service: "harvestwise-ai-api",
    });
  },
};
