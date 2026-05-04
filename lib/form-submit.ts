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

const MOCK_DELAY_MS = 650;

export async function submitLeadForm(payload: LeadFormPayload) {
  // Future integration point: replace the mock with an API route, Supabase insert,
  // n8n webhook, Telegram bot call, or analytics event.
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return { ok: true, payload };
}

export async function submitPartnerForm(payload: PartnerFormPayload) {
  // Future integration point: keep the form contract stable and forward payload
  // to CRM/webhook/partner tracking when the backend is ready.
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return { ok: true, payload };
}
