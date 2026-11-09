import { InputError } from "@/lib/domain/hypothesis";
import { getStep, parseStepValues } from "@/lib/steps";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { isUuid, saveStepResult } from "@/lib/server/projects";

type Context = { params: Promise<{ id: string; stepId: string }> };

export async function PUT(request: Request, context: Context) {
  const { id, stepId } = await context.params;
  return withViewer(request, async (viewer) => {
    const step = getStep(stepId);
    if (!isUuid(id) || !step) return errorJson(404, "not_found", "Шаг не найден.");
    const body = (await readJson(request)) as { values?: unknown; checklist?: unknown; expectedRevision?: unknown };
    const fields = parseStepValues(step, body?.values);
    const checklist = Array.isArray(body?.checklist)
      ? body.checklist.filter((item): item is string => typeof item === "string" && step.checklist.includes(item))
      : [];
    let expectedRevision: number | null = null;
    if (body?.expectedRevision !== undefined && body.expectedRevision !== null) {
      if (!Number.isInteger(body.expectedRevision) || (body.expectedRevision as number) < 0) {
        throw new InputError("Некорректная версия черновика.");
      }
      expectedRevision = body.expectedRevision as number;
    }
    const artifact = await saveStepResult(viewer.accessToken, id, step.id, { fields, checklist }, expectedRevision);
    return json({ success: true, revision: artifact.revision, updatedAt: artifact.updated_at });
  });
}
