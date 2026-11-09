import "server-only";

import { notFound, redirect } from "next/navigation";

import { getProject, getProStatus, isUuid } from "@/lib/server/projects";
import { getViewer } from "@/lib/server/session";
import { StorageUnavailableError } from "@/lib/server/supabase";

export async function requireViewer(nextPath: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return viewer;
}

export type Loaded<T> = { ok: true; data: T } | { ok: false; reason: "storage" };

/** Loads a project for a private page; someone else's id and a missing id both end in 404. */
export async function loadProjectPage(id: string, nextPath: string) {
  const viewer = await requireViewer(nextPath);
  if (!isUuid(id)) notFound();
  try {
    const [project, pro] = await Promise.all([getProject(viewer.accessToken, id), getProStatus(viewer.accessToken)]);
    if (!project) notFound();
    return { ok: true as const, viewer, project, pro };
  } catch (error) {
    if (error instanceof StorageUnavailableError) return { ok: false as const, viewer };
    throw error;
  }
}
