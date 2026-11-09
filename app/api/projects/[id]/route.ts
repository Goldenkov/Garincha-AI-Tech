import { InputError } from "@/lib/domain/hypothesis";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { archiveStartup, isUuid, renameStartup } from "@/lib/server/projects";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    if (!isUuid(id)) return errorJson(404, "not_found", "Проект не найден или недоступен.");
    const body = (await readJson(request)) as { title?: unknown };
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title || title.length > 120) throw new InputError("Название — от 1 до 120 символов.", "title");
    await renameStartup(viewer.accessToken, id, title);
    return json({ success: true });
  });
}

/** Archives the project. Data stays in the database; nothing is deleted by the application. */
export async function DELETE(request: Request, context: Context) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    if (!isUuid(id)) return errorJson(404, "not_found", "Проект не найден или недоступен.");
    await archiveStartup(viewer.accessToken, id);
    return json({ success: true });
  });
}
