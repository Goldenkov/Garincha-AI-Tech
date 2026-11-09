import { withViewer } from "@/lib/server/api";
import { errorJson, json } from "@/lib/server/http";
import { discardRevision, isUuid } from "@/lib/server/projects";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    if (!isUuid(id)) return errorJson(404, "not_found", "Проект не найден или недоступен.");
    await discardRevision(viewer.accessToken, id);
    return json({ success: true });
  });
}
