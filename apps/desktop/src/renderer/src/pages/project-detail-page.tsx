import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProjectDetail } from "@multica/views/projects/components";
import { useWorkspaceId } from "@multica/core/hooks";
import { projectDetailOptions } from "@multica/core/projects/queries";
import { useT } from "@multica/views/i18n";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function ProjectDetailPage() {
  const { t } = useT("desktop");
  const { id } = useParams<{ id: string }>();
  const wsId = useWorkspaceId();
  const { data: project } = useQuery(projectDetailOptions(wsId, id!));

  useDocumentTitle(project ? `${project.icon ? `${project.icon} ` : ""}${project.title}` : t(($) => $.routes.project));

  if (!id) return null;
  return <ProjectDetail projectId={id} />;
}
