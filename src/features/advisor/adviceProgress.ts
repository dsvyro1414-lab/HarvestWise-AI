export interface AdviceLoadingStatus {
  message: string;
}

export function getAdviceLoadingStatus(elapsedSeconds: number): AdviceLoadingStatus {
  if (elapsedSeconds < 4) {
    return { message: "Gemma is starting your explanation…" };
  }

  if (elapsedSeconds < 12) {
    return { message: "Gemma is working on a farmer-friendly answer…" };
  }

  if (elapsedSeconds < 20) {
    return { message: "Still working — detailed AI replies can take a little longer." };
  }

  return {
    message: "Still connected. Keep this page open — your answer will appear here.",
  };
}
