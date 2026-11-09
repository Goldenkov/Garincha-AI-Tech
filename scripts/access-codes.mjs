#!/usr/bin/env node
// Owner-only tool for individual PRO codes. Run manually with the service role key in the environment:
//   node --env-file=.env.local scripts/access-codes.mjs issue --days 365 --note "order 1042"
//   node --env-file=.env.local scripts/access-codes.mjs revoke-code <code-id>
//   node --env-file=.env.local scripts/access-codes.mjs revoke-user <user-uuid> --reason "refund"
// The plain code is printed once and never stored; only its SHA-256 hash is saved.
import { createHash, randomBytes } from "node:crypto";

const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/u, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" };
const [command, target, ...rest] = process.argv.slice(2);

function option(name) {
  const args = [target, ...rest];
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
}

async function request(path, init) {
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  const body = await response.text();
  if (!response.ok) {
    console.error(`Request failed: ${response.status} ${body}`);
    process.exit(1);
  }
  return body ? JSON.parse(body) : null;
}

if (command === "issue") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  const raw = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  const code = `PRO-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
  const days = option("days") ? Number.parseInt(option("days"), 10) : null;
  const maxUses = option("uses") ? Number.parseInt(option("uses"), 10) : 1;
  const [row] = await request("access_codes", {
    method: "POST",
    body: JSON.stringify({
      code_hash: createHash("sha256").update(code).digest("hex"),
      plan: "pro",
      status: "active",
      entitlement_days: Number.isInteger(days) && days > 0 ? days : null,
      max_uses: Number.isInteger(maxUses) && maxUses > 0 ? maxUses : 1,
      note: option("note") ?? null,
    }),
  });
  console.log(`Code id: ${row.id}`);
  console.log(`Code (shown once): ${code}`);
} else if (command === "revoke-code" && target) {
  await request(`access_codes?id=eq.${encodeURIComponent(target)}`, { method: "PATCH", body: JSON.stringify({ status: "revoked" }) });
  const rows = await request(`entitlements?access_code_id=eq.${encodeURIComponent(target)}&revoked_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ revoked_at: new Date().toISOString(), revoke_reason: option("reason") ?? "code revoked" }),
  });
  console.log(`Code revoked; entitlements revoked: ${rows.length}`);
} else if (command === "revoke-user" && target) {
  const rows = await request(`entitlements?user_id=eq.${encodeURIComponent(target)}&revoked_at=is.null`, {
    method: "PATCH",
    body: JSON.stringify({ revoked_at: new Date().toISOString(), revoke_reason: option("reason") ?? "manual" }),
  });
  console.log(`Entitlements revoked: ${rows.length}`);
} else {
  console.log("Usage: issue [--days N] [--uses N] [--note text] | revoke-code <id> [--reason text] | revoke-user <uuid> [--reason text]");
  process.exit(command ? 1 : 0);
}
