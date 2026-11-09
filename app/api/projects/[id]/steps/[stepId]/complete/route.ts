import { getStep, missingStepFields, stepCompletionProblems } from "@/lib/steps";
import { withViewer } from "@/lib/server/api";
import { errorJson, json } from "@/lib/server/http";
import { completeStep, getProject, isUuid } from "@/lib/server/projects";

type Context = { params: Promise<{ id: string; stepId: string }> };

/** The user's confirmation that the step is done; required fields are re-checked on the server. */
export async function POST(request: Request, context: Context) {
  const { id, stepId } = await context.params;
  return withViewer(request, async (viewer) => {
    const step = getStep(stepId);
    if (!isUuid(id) || !step) return errorJson(404, "not_found", "Шаг не найден.");
    const project = await getProject(viewer.accessToken, id);
    if (!project) return errorJson(404, "not_found", "Проект не найден или недоступен.");

    const values = project.artifacts.find((artifact) => artifact.stepId === step.id)?.content.fields ?? {};
    const problems = stepCompletionProblems(step, values);
    if (problems.length) {
      return errorJson(422, "step_incomplete", problems[0], { missing: missingStepFields(step, values) });
    }

    const result = await completeStep(viewer.accessToken, id, step.id);
    if (result.status !== "completed") {
      return errorJson(422, "step_incomplete", "Заполните обязательные поля, чтобы завершить шаг.", { missing: result.missing });
    }
    return json({ success: true, status: result.status });
  });
}
