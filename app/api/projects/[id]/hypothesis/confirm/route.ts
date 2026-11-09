import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { isUuid, requestConfirmation } from "@/lib/server/projects";

/** Checks completeness on the server and moves a complete draft to "awaiting confirmation". */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    const body = (await readJson(request)) as { hypothesisId?: unknown };
    if (!isUuid(id) || !isUuid(body?.hypothesisId)) return errorJson(404, "not_found", "Гипотеза не найдена.");
    const missing = await requestConfirmation(viewer.accessToken, body.hypothesisId);
    return json({ success: true, ready: missing.length === 0, missing });
  });
}
