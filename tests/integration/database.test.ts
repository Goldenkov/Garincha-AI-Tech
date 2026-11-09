/**
 * Runs against a local Supabase stack (`supabase start`) and checks the guarantees the database
 * itself must enforce, independent of the Next.js layer. It refuses to run against a remote URL.
 */
import { createHash, randomBytes } from "node:crypto";

import { beforeAll, describe, expect, it } from "vitest";

import { suggestHypothesis } from "@/lib/domain/hypothesis";

const url = (process.env.SUPABASE_URL ?? "").replace(/\/+$/u, "");
const anonKey = process.env.SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const isLocal = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/u.test(url);

type Session = { userId: string; token: string };

async function admin(path: string, init: RequestInit = {}) {
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${path} → ${response.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function createUser(tag: string): Promise<Session> {
  const email = `int-${tag}-${Date.now()}-${randomBytes(3).toString("hex")}@example.com`;
  const password = randomBytes(18).toString("base64url");
  const user = await admin("/auth/v1/admin/users", { method: "POST", body: JSON.stringify({ email, password, email_confirm: true }) });
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const session = (await response.json()) as { access_token: string };
  return { userId: user.id, token: session.access_token };
}

async function rest(token: string | null, path: string, init: RequestInit = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token ?? anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body: body as Record<string, unknown> & Record<string, unknown>[] };
}

const rpc = (token: string | null, name: string, args: Record<string, unknown>) => rest(token, `rpc/${name}`, { method: "POST", body: JSON.stringify(args) });

function starterFields() {
  return suggestHypothesis({ ideaText: "Шкафы в нишу", nicheId: "custom-furniture", businessModel: "made_to_order" });
}

async function createProject(owner: Session) {
  const created = await rpc(owner.token, "create_startup", {
    p_title: "Мебель на заказ",
    p_entry_mode: "catalog",
    p_profile: { region: "Казань", confirmed: true },
    p_hypothesis: starterFields(),
  });
  expect(created.status).toBe(200);
  return created.body as unknown as string;
}

async function approveCurrent(owner: Session, startupId: string) {
  const rows = await rest(owner.token, `startup_hypotheses?startup_id=eq.${startupId}&status=neq.superseded&order=version.desc&limit=1`);
  const hypothesisId = rows.body[0].id as string;
  const missing = await rpc(owner.token, "request_hypothesis_confirmation", { p_hypothesis_id: hypothesisId });
  expect(missing.body).toEqual([]);
  const approved = await rpc(owner.token, "approve_hypothesis", { p_hypothesis_id: hypothesisId });
  expect(approved.status).toBe(200);
  return approved.body as unknown as { version: number; flagged_artifacts: number };
}

describe.skipIf(!isLocal || !anonKey || !serviceKey)("database guarantees (local Supabase)", () => {
  let alice: Session;
  let bob: Session;
  let projectId: string;

  beforeAll(async () => {
    [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
    projectId = await createProject(alice);
  });

  describe("isolation by UUID", () => {
    it("another user cannot read the project, its hypothesis or profile", async () => {
      for (const table of ["startups?id", "startup_hypotheses?startup_id", "startup_profiles?startup_id", "startup_artifacts?startup_id"]) {
        const response = await rest(bob.token, `${table}=eq.${projectId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      }
    });

    it("another user cannot write through any RPC", async () => {
      const attempts = [
        rpc(bob.token, "rename_startup", { p_startup_id: projectId, p_title: "hijack" }),
        rpc(bob.token, "archive_startup", { p_startup_id: projectId }),
        rpc(bob.token, "update_startup_profile", { p_startup_id: projectId, p_profile: { region: "x" } }),
        rpc(bob.token, "save_hypothesis_draft", { p_startup_id: projectId, p_fields: { targetCustomer: "x" } }),
        rpc(bob.token, "save_step_result", { p_startup_id: projectId, p_step_id: "demand-check", p_content: {} }),
        rpc(bob.token, "complete_step", { p_startup_id: projectId, p_step_id: "demand-check" }),
      ];
      for (const response of await Promise.all(attempts)) {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(JSON.stringify(response.body)).toContain("not_found");
      }
      const own = await rest(alice.token, `startups?id=eq.${projectId}&select=title,status`);
      expect(own.body[0]).toMatchObject({ title: "Мебель на заказ", status: "active" });
    });

    it("direct table writes are refused even for the owner", async () => {
      const insert = await rest(alice.token, "startups", { method: "POST", body: JSON.stringify({ owner_id: alice.userId, title: "direct", entry_mode: "own_idea" }) });
      expect(insert.status).toBe(403);
      const update = await rest(alice.token, `startups?id=eq.${projectId}`, { method: "PATCH", body: JSON.stringify({ title: "direct" }) });
      expect(update.status).toBe(403);
    });

    it("anonymous callers get nothing", async () => {
      expect((await rest(null, "startups?select=id")).status).toBe(401);
      expect((await rpc(null, "create_startup", { p_title: "x", p_entry_mode: "own_idea" })).status).toBe(401);
    });
  });

  describe("hypothesis lifecycle and step gate", () => {
    it("steps are locked until the hypothesis is approved", async () => {
      const blocked = await rpc(alice.token, "save_step_result", { p_startup_id: projectId, p_step_id: "demand-check", p_content: { fields: {} } });
      expect(JSON.stringify(blocked.body)).toContain("hypothesis_not_approved");
    });

    it("approval opens the free step; PRO steps stay closed without an entitlement", async () => {
      expect(await approveCurrent(alice, projectId)).toMatchObject({ version: 1 });
      const saved = await rpc(alice.token, "save_step_result", {
        p_startup_id: projectId,
        p_step_id: "demand-check",
        p_content: { fields: { method: "interviews" }, checklist: [] },
      });
      expect(saved.status).toBe(200);
      const pro = await rpc(alice.token, "save_step_result", { p_startup_id: projectId, p_step_id: "offer-packaging", p_content: { fields: {} } });
      expect(JSON.stringify(pro.body)).toContain("pro_required");
    });

    it("a stale revision is a conflict, not a silent overwrite", async () => {
      const current = await rest(alice.token, `startup_artifacts?startup_id=eq.${projectId}&step_id=eq.demand-check&select=revision`);
      const revision = current.body[0].revision as number;
      const fresh = await rpc(alice.token, "save_step_result", {
        p_startup_id: projectId,
        p_step_id: "demand-check",
        p_content: { fields: { method: "pilot" } },
        p_expected_revision: revision,
      });
      expect(fresh.status).toBe(200);
      const stale = await rpc(alice.token, "save_step_result", {
        p_startup_id: projectId,
        p_step_id: "demand-check",
        p_content: { fields: { method: "landing" } },
        p_expected_revision: revision,
      });
      expect(JSON.stringify(stale.body)).toContain("conflict");
    });

    it("a material edit creates a new version, keeps history and flags dependent results", async () => {
      const draft = await rpc(alice.token, "save_hypothesis_draft", {
        p_startup_id: projectId,
        p_fields: { ...starterFields(), targetCustomer: "Семьи в новостройках" },
        p_expected_updated_at: null,
      });
      expect(draft.status).toBe(200);
      expect((draft.body as unknown as { version: number }).version).toBe(2);

      const approved = await approveCurrent(alice, projectId);
      expect(approved).toMatchObject({ version: 2, flagged_artifacts: 1 });

      const versions = await rest(alice.token, `startup_hypotheses?startup_id=eq.${projectId}&select=version,status&order=version`);
      expect(versions.body).toEqual([
        { version: 1, status: "superseded" },
        { version: 2, status: "approved_by_user" },
      ]);
      const artifact = await rest(alice.token, `startup_artifacts?startup_id=eq.${projectId}&step_id=eq.demand-check&select=review_status`);
      expect(artifact.body[0].review_status).toBe("requires_review");
    });
  });

  describe("PRO access codes", () => {
    async function issue({ days = null, maxUses = 1 }: { days?: number | null; maxUses?: number } = {}) {
      const code = `PRO-TEST-${randomBytes(8).toString("hex").toUpperCase()}`;
      const [row] = await admin("/rest/v1/access_codes", {
        method: "POST",
        body: JSON.stringify({ code_hash: createHash("sha256").update(code).digest("hex"), plan: "pro", status: "active", entitlement_days: days, max_uses: maxUses }),
      });
      return { code, id: row.id as string };
    }
    const status = async (session: Session) => (await rpc(session.token, "my_pro_status", {})).body as unknown as { active: boolean };

    it("a code works once, for one account, and is not shared", async () => {
      const { code } = await issue({ days: 30 });
      expect((await rpc(bob.token, "redeem_access_code", { p_code: code })).body).toMatchObject({ status: "granted" });
      expect(await status(bob)).toMatchObject({ active: true });
      const reuse = await rpc(alice.token, "redeem_access_code", { p_code: code });
      expect(JSON.stringify(reuse.body)).toContain("invalid_code");
      expect(await status(alice)).toMatchObject({ active: false });
    });

    it("users cannot read codes or grant themselves entitlements", async () => {
      expect((await rest(bob.token, "access_codes?select=id")).status).toBe(403);
      const self = await rest(bob.token, "entitlements", { method: "POST", body: JSON.stringify({ user_id: bob.userId, plan: "pro", source: "manual" }) });
      expect(self.status).toBe(403);
    });

    it("revocation and expiry end access", async () => {
      const carol = await createUser("carol");
      const { code } = await issue({ days: 30 });
      await rpc(carol.token, "redeem_access_code", { p_code: code });
      expect(await status(carol)).toMatchObject({ active: true });

      await admin(`/rest/v1/entitlements?user_id=eq.${carol.userId}`, {
        method: "PATCH",
        body: JSON.stringify({ expires_at: new Date(Date.now() - 1000).toISOString() }),
      });
      expect(await status(carol)).toMatchObject({ active: false });

      const second = await issue();
      await rpc(carol.token, "redeem_access_code", { p_code: second.code });
      expect(await status(carol)).toMatchObject({ active: true });
      await admin(`/rest/v1/entitlements?user_id=eq.${carol.userId}&revoked_at=is.null`, {
        method: "PATCH",
        body: JSON.stringify({ revoked_at: new Date().toISOString(), revoke_reason: "test" }),
      });
      expect(await status(carol)).toMatchObject({ active: false });
    });

    it("a revoked code cannot be redeemed", async () => {
      const { code, id } = await issue();
      await admin(`/rest/v1/access_codes?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: "revoked" }) });
      expect(JSON.stringify((await rpc(alice.token, "redeem_access_code", { p_code: code })).body)).toContain("invalid_code");
    });
  });
});
