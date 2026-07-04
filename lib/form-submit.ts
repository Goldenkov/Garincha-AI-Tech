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

export async function submitLeadForm(payload: LeadFormPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => ({ success: false, error: "Ошибка отправки заявки." }))) as {
    success: boolean;
    error?: string;
  };

  return {
    ok: response.ok && result.success,
    error: result.error,
  };
}

export async function submitPartnerForm(payload: PartnerFormPayload) {
  const MOCK_DELAY_MS = 650;
  // Future integration point: keep the form contract stable and forward payload
  // to CRM/webhook/partner tracking when the backend is ready.
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return { ok: true, payload };
}
