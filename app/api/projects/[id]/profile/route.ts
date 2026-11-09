import { parseProfile } from "@/lib/domain/profile";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { isUuid, updateProfile } from "@/lib/server/projects";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    if (!isUuid(id)) return errorJson(404, "not_found", "Проект не найден или недоступен.");
    const profile = parseProfile(await readJson(request));
    await updateProfile(viewer.accessToken, id, profile);
    return json({ success: true });
  });
}
