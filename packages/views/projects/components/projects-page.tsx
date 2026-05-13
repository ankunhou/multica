"use client";

import { useState, useCallback } from "react";
import { Plus, FolderKanban, UserMinus, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectListOptions } from "@multica/core/projects/queries";
import { useUpdateProject } from "@multica/core/projects/mutations";
import {
  PROJECT_STATUS_ORDER,
  PROJECT_PRIORITY_ORDER,
} from "@multica/core/projects/config";
import { useWorkspaceId } from "@multica/core/hooks";
import { useWorkspacePaths } from "@multica/core/paths";
import { memberListOptions, agentListOptions } from "@multica/core/workspace/queries";
import { useModalStore } from "@multica/core/modals";
import { AppLink, useNavigation } from "../../navigation";
import { ActorAvatar } from "../../common/actor-avatar";
import { useActorName } from "@multica/core/workspace/hooks";
import { Skeleton } from "@multica/ui/components/ui/skeleton";
import { Button } from "@multica/ui/components/ui/button";
import { cn } from "@multica/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@multica/ui/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@multica/ui/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@multica/ui/components/ui/tooltip";
import type { Project, ProjectStatus, ProjectPriority, UpdateProjectRequest } from "@multica/core/types";
import { PageHeader } from "../../layout/page-header";
import {
  ResourcePageBody,
  ResourceInteractiveRegion,
  ResourceSurface,
  ResourceViewToggle,
  resourceActionButtonClassName,
  resourceHeaderIconClassName,
} from "../../common/resource-view";
import { useResourceViewModePreference } from "../../common/use-resource-view-mode";
import { PriorityIcon } from "../../issues/components/priority-icon";
import { ProjectIcon } from "./project-icon";
import { ProjectProgressMeter, getProjectProgressPercent } from "./project-progress-meter";
import { ProjectStatusBadge, ProjectStatusDot } from "./project-status-badge";
import { PROJECT_PRIORITY_VISUALS } from "./visuals";
import { useT } from "../../i18n";
import {
  useProjectStatusLabels,
  useProjectPriorityLabels,
  useFormatRelativeDate,
} from "./labels";

const PROJECT_VIEW_MODE_STORAGE_KEY = "multica:projects:view-mode";

function ProjectPriorityControl({
  project,
  onUpdate,
  className,
}: {
  project: Project;
  onUpdate: (data: UpdateProjectRequest) => void;
  className?: string;
}) {
  const priorityLabels = useProjectPriorityLabels();
  const priorityVisual = PROJECT_PRIORITY_VISUALS[project.priority];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex w-24 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-background/80",
              className,
            )}
          >
            <PriorityIcon priority={project.priority} />
            <span className={cn("text-xs", priorityVisual.color)}>{priorityLabels[project.priority]}</span>
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-44">
        {PROJECT_PRIORITY_ORDER.map((p) => (
          <DropdownMenuItem key={p} onClick={() => onUpdate({ priority: p as ProjectPriority })}>
            <PriorityIcon priority={p} />
            <span>{priorityLabels[p]}</span>
            {p === project.priority && <Check className="ml-auto h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectStatusControl({
  project,
  onUpdate,
  className,
}: {
  project: Project;
  onUpdate: (data: UpdateProjectRequest) => void;
  className?: string;
}) {
  const statusLabels = useProjectStatusLabels();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex w-28 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-80",
              className,
            )}
          >
            <ProjectStatusBadge status={project.status} className="w-full" />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-44">
        {PROJECT_STATUS_ORDER.map((s) => (
          <DropdownMenuItem key={s} onClick={() => onUpdate({ status: s as ProjectStatus })}>
            <ProjectStatusDot status={s} />
            <span>{statusLabels[s]}</span>
            {s === project.status && <Check className="ml-auto h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectProgressInline({ project }: { project: Project }) {
  if (project.issue_count === 0) {
    return <span className="text-xs text-muted-foreground">--</span>;
  }

  return (
    <>
      <ProjectProgressMeter
        done={project.done_count}
        total={project.issue_count}
        className="w-12"
      />
      <span className="text-xs text-muted-foreground tabular-nums">
        {project.done_count}/{project.issue_count}
      </span>
    </>
  );
}

function ProjectLeadPicker({
  project,
  onUpdate,
}: {
  project: Project;
  onUpdate: (data: UpdateProjectRequest) => void;
}) {
  const { t } = useT("projects");
  const wsId = useWorkspaceId();
  const { data: members = [] } = useQuery(memberListOptions(wsId));
  const { data: agents = [] } = useQuery(agentListOptions(wsId));
  const { getActorName } = useActorName();
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadFilter, setLeadFilter] = useState("");
  const leadQuery = leadFilter.toLowerCase();
  const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(leadQuery));
  const filteredAgents = agents.filter((a) => !a.archived_at && a.name.toLowerCase().includes(leadQuery));

  return (
    <Popover open={leadOpen} onOpenChange={(v) => { setLeadOpen(v); if (!v) setLeadFilter(""); }}>
      <PopoverTrigger
        render={
          <button type="button" className="flex w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all hover:bg-background/80">
            {project.lead_type && project.lead_id ? (
              <Tooltip>
                <TooltipTrigger render={<span><ActorAvatar actorType={project.lead_type} actorId={project.lead_id} size={22} enableHoverCard /></span>} />
                <TooltipContent side="bottom">{getActorName(project.lead_type, project.lead_id)}</TooltipContent>
              </Tooltip>
            ) : (
              <span className="h-[22px] w-[22px] rounded-full border border-dashed border-muted-foreground/25 bg-muted/40" />
            )}
          </button>
        }
      />
      <PopoverContent align="start" className="w-52 p-0">
        <div className="px-2 py-1.5 border-b">
          <input
            type="text"
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value)}
            placeholder={t(($) => $.lead.assign_placeholder)}
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground outline-none"
          />
        </div>
        <div className="p-1 max-h-60 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onUpdate({ lead_type: null, lead_id: null }); setLeadOpen(false); }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <UserMinus className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{t(($) => $.lead.no_lead)}</span>
          </button>
          {filteredMembers.length > 0 && (
            <>
              <div className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t(($) => $.lead.members_group)}</div>
              {filteredMembers.map((m) => (
                <button
                  type="button"
                  key={m.user_id}
                  onClick={() => { onUpdate({ lead_type: "member", lead_id: m.user_id }); setLeadOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <ActorAvatar actorType="member" actorId={m.user_id} size={16} />
                  <span>{m.name}</span>
                </button>
              ))}
            </>
          )}
          {filteredAgents.length > 0 && (
            <>
              <div className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">{t(($) => $.lead.agents_group)}</div>
              {filteredAgents.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => { onUpdate({ lead_type: "agent", lead_id: a.id }); setLeadOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  <ActorAvatar actorType="agent" actorId={a.id} size={16} showStatusDot />
                  <span>{a.name}</span>
                </button>
              ))}
            </>
          )}
          {filteredMembers.length === 0 && filteredAgents.length === 0 && leadFilter && (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">{t(($) => $.lead.no_results)}</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const wsPaths = useWorkspacePaths();
  const formatRelativeDate = useFormatRelativeDate();
  const updateProject = useUpdateProject();

  const handleUpdate = useCallback(
    (data: UpdateProjectRequest) => {
      updateProject.mutate({ id: project.id, ...data });
    },
    [project.id, updateProject],
  );

  return (
    <div className="group/row flex min-h-14 items-center gap-2 rounded-2xl px-3 text-sm transition-colors hover:bg-accent/45">
      {/* Icon + Name (navigates to detail) */}
      <AppLink
        href={wsPaths.projectDetail(project.id)}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <ProjectIcon project={project} size="md" />
        <span className="min-w-0 flex-1 truncate font-medium">{project.title}</span>
      </AppLink>

      {/* Priority — dropdown */}
      <ProjectPriorityControl project={project} onUpdate={handleUpdate} />

      {/* Status — dropdown */}
      <ProjectStatusControl project={project} onUpdate={handleUpdate} />

      {/* Progress (read-only) */}
      <span className="flex w-24 items-center justify-center gap-1.5 shrink-0">
        <ProjectProgressInline project={project} />
      </span>

      {/* Lead — popover */}
      <ProjectLeadPicker project={project} onUpdate={handleUpdate} />

      {/* Created */}
      <span className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {formatRelativeDate(project.created_at)}
      </span>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const { t } = useT("projects");
  const wsPaths = useWorkspacePaths();
  const router = useNavigation();
  const formatRelativeDate = useFormatRelativeDate();
  const updateProject = useUpdateProject();
  const href = wsPaths.projectDetail(project.id);
  const progress = getProjectProgressPercent(project.done_count, project.issue_count);

  const handleUpdate = useCallback(
    (data: UpdateProjectRequest) => {
      updateProject.mutate({ id: project.id, ...data });
    },
    [project.id, updateProject],
  );

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) return;
      if ((event.metaKey || event.ctrlKey || event.shiftKey) && router.openInNewTab) {
        router.openInNewTab(href);
        return;
      }
      router.push(href);
    },
    [href, router],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.defaultPrevented) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      router.push(href);
    },
    [href, router],
  );

  return (
    <ResourceSurface
      role="link"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="flex min-h-48 cursor-pointer flex-col p-4 transition-colors hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
            <ProjectIcon project={project} size="md" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{project.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {formatRelativeDate(project.created_at)}
            </span>
          </span>
        </div>
        <ResourceInteractiveRegion>
          <ProjectLeadPicker project={project} onUpdate={handleUpdate} />
        </ResourceInteractiveRegion>
      </div>

      <ResourceInteractiveRegion className="mt-4 flex flex-wrap gap-2">
        <ProjectPriorityControl project={project} onUpdate={handleUpdate} className="w-auto bg-muted/45 px-2.5" />
        <ProjectStatusControl project={project} onUpdate={handleUpdate} className="w-auto px-2.5" />
      </ResourceInteractiveRegion>

      <div className="mt-auto pt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t(($) => $.table.progress)}</span>
          <span className="tabular-nums">
            {project.issue_count > 0 ? `${project.done_count}/${project.issue_count}` : "--"}
          </span>
        </div>
        <ProjectProgressMeter
          done={project.done_count}
          total={project.issue_count}
          className="h-1.5"
          aria-label={`${progress}%`}
        />
      </div>
    </ResourceSurface>
  );
}

export function ProjectsPage() {
  const { t } = useT("projects");
  const wsId = useWorkspaceId();
  const { data: projects = [], isLoading } = useQuery(projectListOptions(wsId));
  const openCreateProject = () => useModalStore.getState().open("create-project");
  const [viewMode, setViewMode] = useResourceViewModePreference(
    PROJECT_VIEW_MODE_STORAGE_KEY,
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <PageHeader className="h-auto items-center justify-between border-b-0 px-6 py-6 md:px-10 md:py-8">
        <div className="flex min-w-0 items-center gap-2">
          <span className={resourceHeaderIconClassName}>
            <FolderKanban className="h-3.5 w-3.5" />
          </span>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{t(($) => $.page.title)}</h1>
          {!isLoading && projects.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{projects.length}</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ResourceViewToggle
            value={viewMode}
            onChange={setViewMode}
            listLabel={t(($) => $.page.view_list)}
            gridLabel={t(($) => $.page.view_grid)}
          />
          <Button size="sm" variant="outline" className={resourceActionButtonClassName} onClick={openCreateProject}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t(($) => $.page.new_project)}
          </Button>
        </div>
      </PageHeader>

      {/* Table */}
      <ResourcePageBody>
        {isLoading ? (
          <ResourceSurface className="mx-auto w-full max-w-6xl overflow-hidden p-2">
            <div className="flex h-9 items-center gap-2 px-3">
              <span className="shrink-0 w-[24px]" />
              <Skeleton className="h-3 w-12 flex-1 max-w-[48px]" />
              <Skeleton className="h-3 w-12 shrink-0" />
              <Skeleton className="h-3 w-12 shrink-0" />
              <Skeleton className="h-3 w-12 shrink-0" />
              <Skeleton className="h-3 w-8 shrink-0" />
              <Skeleton className="h-3 w-12 shrink-0" />
            </div>
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          </ResourceSurface>
        ) : projects.length === 0 ? (
          <div className="mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center pb-16 text-muted-foreground">
            <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-muted/60">
              <FolderKanban className="h-5 w-5" />
            </span>
            <p className="text-sm text-foreground">{t(($) => $.page.empty)}</p>
            <Button size="sm" variant="outline" className="mt-3 rounded-full" onClick={openCreateProject}>
              {t(($) => $.page.create_first)}
            </Button>
          </div>
        ) : (
          viewMode === "list" ? (
            <ResourceSurface className="mx-auto w-full max-w-6xl overflow-hidden p-2">
              {/* Column headers */}
              <div className="flex h-9 items-center gap-2 px-3 text-xs font-medium text-muted-foreground">
                {/* Icon spacer + Name */}
                <span className="shrink-0 w-[24px]" />
                <span className="min-w-0 flex-1">{t(($) => $.table.name)}</span>
                <span className="w-24 text-center shrink-0">{t(($) => $.table.priority)}</span>
                <span className="w-28 text-center shrink-0">{t(($) => $.table.status)}</span>
                <span className="w-24 text-center shrink-0">{t(($) => $.table.progress)}</span>
                <span className="w-10 text-center shrink-0">{t(($) => $.table.lead)}</span>
                <span className="w-20 text-right shrink-0">{t(($) => $.table.created)}</span>
              </div>
              {/* Rows */}
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </ResourceSurface>
          ) : (
            <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )
        )}
      </ResourcePageBody>
    </div>
  );
}
