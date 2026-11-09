import { InputError } from "@/lib/domain/hypothesis";
import { withViewer } from "@/lib/server/api";
import { errorJson, json, readJson } from "@/lib/server/http";
import { approveHypothesis, isUuid } from "@/lib/server/projects";

/**
 * The user's explicit confirmation of the hypothesis. It records a decision to test the idea;
 * it is not evidence of demand, so the request must carry that acknowledgement.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return withViewer(request, async (viewer) => {
    const body = (await readJson(request)) as { hypothesisId?: unknown; acknowledged?: unknown };
    if (!isUuid(id) || !isUuid(body?.hypothesisId)) return errorJson(404, "not_found", "Гипотеза не найдена.");
    if (body.acknowledged !== true) {
      throw new InputError("Подтвердите, что понимаете: это гипотеза для проверки, а не доказанный спрос.", "acknowledged");
    }
    const result = await approveHypothesis(viewer.accessToken, body.hypothesisId);
    return json({ success: true, ...result });
  });
}
