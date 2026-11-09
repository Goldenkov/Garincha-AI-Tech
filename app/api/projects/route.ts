import { InputError, hypothesisTitle, parseHypothesisPatch, emptyHypothesisFields, applyPatch } from "@/lib/domain/hypothesis";
import { parseProfile } from "@/lib/domain/profile";
import { withViewer } from "@/lib/server/api";
import { json, readJson } from "@/lib/server/http";
import { createStartup, type EntryMode } from "@/lib/server/projects";

const entryModes: EntryMode[] = ["own_idea", "catalog", "advisor", "existing_business"];

export async function POST(request: Request) {
  return withViewer(
    request,
    async (viewer) => {
      const body = (await readJson(request)) as Record<string, unknown>;
      if (!body || typeof body !== "object") throw new InputError("Некорректные данные проекта.");
      const entryMode = body.entryMode as EntryMode;
      if (!entryModes.includes(entryMode)) throw new InputError("Неизвестный способ старта.", "entryMode");

      const profile = parseProfile(body.profile);
      const hypothesis = parseHypothesisPatch(body.hypothesis ?? {});
      const merged = applyPatch(emptyHypothesisFields(), hypothesis);
      if (entryMode === "own_idea" && !merged.ideaText) throw new InputError("Опишите идею хотя бы одной фразой.", "ideaText");

      const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
      if (rawTitle.length > 120) throw new InputError("Название — не длиннее 120 символов.", "title");
      const title = rawTitle || (entryMode === "existing_business" ? "Мой действующий бизнес" : hypothesisTitle(merged));

      const id = await createStartup(viewer.accessToken, { title, entryMode, profile, hypothesis });
      return json({ success: true, id }, 201);
    },
    { limit: 20 },
  );
}
