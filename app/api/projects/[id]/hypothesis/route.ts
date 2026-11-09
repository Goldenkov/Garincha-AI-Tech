import { InputError, parseHypothesisPatch } from "@/lib/domain/hypothesis";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { isUuid, saveHypothesisDraft } from "@/lib/server/projects";

/** Saves the open draft or starts a new version from the approved hypothesis. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    if (!isUuid(id)) return errorJson(404, "not_found", "Проект не найден или недоступен.");
    const body = (await readJson(request)) as { fields?: unknown; expectedUpdatedAt?: unknown };
    const patch = parseHypothesisPatch(body?.fields);
    let expected: string | null = null;
    if (typeof body?.expectedUpdatedAt === "string") {
      if (Number.isNaN(Date.parse(body.expectedUpdatedAt))) throw new InputError("Некорректная отметка времени.");
      expected = body.expectedUpdatedAt;
    }
    const hypothesis = await saveHypothesisDraft(viewer.accessToken, id, patch, expected);
    return json({ success: true, hypothesis });
  });
}
