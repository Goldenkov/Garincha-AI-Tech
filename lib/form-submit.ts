export type LeadFormPayload = {
  name: string;
  email: string;
  telegram?: string;
  businessNiche: string;
  mainGoal: string;
  consent: boolean;
};

export type PartnerFormPayload = {
  name: string;
  email: string;
  telegram?: string;
  channelUrl: string;
  audienceSize: string;
  cooperationFormat: string;
  consent: boolean;
};

export type FeedbackFormPayload = {
  name: string;
  niche: string;
  clear: string;
  stuck: string;
  result: string;
  missing: string;
  rating: string | number;
};

type SubmitResult = {
  ok: boolean;
  error?: string;
};

async function postJson(url: string, payload: unknown, fallbackError: string): Promise<SubmitResult> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => ({ success: false, error: fallbackError }))) as {
    success: boolean;
    error?: string;
  };

  return {
    ok: response.ok && result.success,
    error: result.error ?? fallbackError,
  };
}

export async function submitLeadForm(payload: LeadFormPayload) {
  return postJson("/api/leads", payload, "Не удалось отправить заявку. Попробуйте позже.");
}

export async function submitPartnerForm(payload: PartnerFormPayload) {
  return postJson("/api/partners", payload, "Не удалось отправить заявку партнёра. Попробуйте позже.");
}

export async function submitFeedbackForm(payload: FeedbackFormPayload) {
  return postJson("/api/feedback", payload, "Не удалось отправить отзыв. Попробуйте позже.");
}
