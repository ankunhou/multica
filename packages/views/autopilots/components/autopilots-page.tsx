"use client";

import { useState } from "react";
import {
  Plus,
  Zap,
  Play,
  Pause,
  AlertCircle,
  Newspaper,
  GitPullRequest,
  Bug,
  BarChart3,
  Shield,
  FileSearch,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { autopilotListOptions } from "@multica/core/autopilots/queries";
import { useWorkspaceId } from "@multica/core/hooks";
import { useWorkspacePaths } from "@multica/core/paths";
import { useActorName } from "@multica/core/workspace/hooks";
import { AppLink } from "../../navigation";
import { ActorAvatar } from "../../common/actor-avatar";
import { PageHeader } from "../../layout/page-header";
import { Skeleton } from "@multica/ui/components/ui/skeleton";
import { Button } from "@multica/ui/components/ui/button";
import { StatusIndicator } from "@multica/ui/components/ui/status-indicator";
import { AutopilotDialog } from "./autopilot-dialog";
import type { Autopilot, AutopilotStatus, AutopilotExecutionMode } from "@multica/core/types";
import type { TriggerFrequency } from "./trigger-config";
import { useT } from "../../i18n";

// Template-id keyed lookup for i18n labels and prompt bodies.
type TemplateId =
  | "daily_news"
  | "pr_review"
  | "bug_triage"
  | "weekly_progress"
  | "dependency_audit"
  | "documentation_check";

interface AutopilotTemplate {
  id: TemplateId;
  icon: typeof Zap;
  frequency: TriggerFrequency;
  time: string;
}

const TEMPLATES: AutopilotTemplate[] = [
  {
    id: "daily_news",
    icon: Newspaper,
    frequency: "daily",
    time: "09:00",
  },
  {
    id: "pr_review",
    icon: GitPullRequest,
    frequency: "weekdays",
    time: "10:00",
  },
  {
    id: "bug_triage",
    icon: Bug,
    frequency: "weekdays",
    time: "09:00",
  },
  {
    id: "weekly_progress",
    icon: BarChart3,
    frequency: "weekly",
    time: "17:00",
  },
  {
    id: "dependency_audit",
    icon: Shield,
    frequency: "weekly",
    time: "08:00",
  },
  {
    id: "documentation_check",
    icon: FileSearch,
    frequency: "weekly",
    time: "14:00",
  },
];

// Hook returning a localized "1d ago / Today" formatter for the row's last_run cell.
function useFormatRelativeDate(): (date: string) => string {
  const { t } = useT("autopilots");
  return (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return t(($) => $.relative_date.today);
    if (days === 1) return t(($) => $.relative_date.one_day_ago);
    if (days < 30) return t(($) => $.relative_date.days_ago, { count: days });
    const months = Math.floor(days / 30);
    return t(($) => $.relative_date.months_ago, { count: months });
  };
}

const STATUS_VISUAL: Record<
  AutopilotStatus,
  { tone: "success" | "warning" | "muted"; icon: typeof Zap }
> = {
  active: { tone: "success", icon: Play },
  paused: { tone: "warning", icon: Pause },
  archived: { tone: "muted", icon: AlertCircle },
};

function AutopilotRow({ autopilot }: { autopilot: Autopilot }) {
  const { t } = useT("autopilots");
  const { getActorName } = useActorName();
  const wsPaths = useWorkspacePaths();
  const formatRelativeDate = useFormatRelativeDate();
  const visual = STATUS_VISUAL[autopilot.status as AutopilotStatus] ?? STATUS_VISUAL.active;
  const StatusIcon = visual.icon;

  return (
    <div className="group/row flex flex-col gap-2 border-b border-border/70 px-4 py-3 text-sm transition-colors hover:bg-accent/35 sm:h-12 sm:flex-row sm:items-center sm:gap-2 sm:border-b-0 sm:px-5 sm:py-0">
      <AppLink
        href={wsPaths.autopilotDetail(autopilot.id)}
        className="flex min-w-0 items-center gap-2 sm:flex-1"
      >
        <Zap className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate font-medium">{autopilot.title}</span>
      </AppLink>

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-xs sm:contents sm:pl-0">
        {/* Agent */}
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground sm:w-32 sm:shrink-0">
          <ActorAvatar
            actorType="agent"
            actorId={autopilot.assignee_id}
            size={18}
            enableHoverCard
            showStatusDot
          />
          <span className="truncate">{getActorName("agent", autopilot.assignee_id)}</span>
        </span>

        {/* Mode */}
        <span className="text-muted-foreground sm:w-24 sm:shrink-0 sm:text-center">
          {t(($) => $.execution_mode[autopilot.execution_mode as AutopilotExecutionMode])}
        </span>

        {/* Status */}
        <StatusIndicator
          tone={visual.tone}
          icon={StatusIcon}
          className="sm:w-20 sm:shrink-0 sm:justify-center"
        >
          {t(($) => $.status[autopilot.status as AutopilotStatus])}
        </StatusIndicator>

        {/* Last run */}
        <span className="text-muted-foreground tabular-nums sm:w-20 sm:shrink-0 sm:text-right">
          {autopilot.last_run_at
            ? formatRelativeDate(autopilot.last_run_at)
            : t(($) => $.page.last_run_empty)}
        </span>
      </div>
    </div>
  );
}

export function AutopilotsPage() {
  const { t } = useT("autopilots");
  const wsId = useWorkspaceId();
  const { data: autopilots = [], isLoading } = useQuery(autopilotListOptions(wsId));
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AutopilotTemplate | null>(null);

  const openCreate = (template?: AutopilotTemplate) => {
    setSelectedTemplate(template ?? null);
    setCreateOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeader className="h-auto items-center justify-between border-b-0 px-6 py-6 md:px-12 md:py-8">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
            </span>
            <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
              {t(($) => $.page.title)}
            </h1>
            {!isLoading && autopilots.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {autopilots.length}
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => openCreate()} className="rounded-full px-4 shadow-sm">
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t(($) => $.page.new_autopilot)}
        </Button>
      </PageHeader>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2 md:px-12">
        {isLoading ? (
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="sticky top-0 z-[1] hidden h-10 items-center gap-2 border-b bg-muted/25 px-5 sm:flex">
              <span className="shrink-0 w-4" />
              <Skeleton className="h-3 w-12 flex-1 max-w-[48px]" />
              <Skeleton className="h-3 w-12 shrink-0" />
              <Skeleton className="h-3 w-10 shrink-0" />
              <Skeleton className="h-3 w-10 shrink-0" />
              <Skeleton className="h-3 w-12 shrink-0" />
            </div>
            <div className="space-y-2 p-4 sm:space-y-1 sm:p-5 sm:pt-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full sm:h-11" />
              ))}
            </div>
          </div>
        ) : autopilots.length === 0 ? (
          <div className="mx-auto flex min-h-[520px] w-full max-w-3xl flex-col items-center justify-center px-2 pb-16">
            <span className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
              <Zap className="h-5 w-5" />
            </span>
            <p className="text-base font-medium">{t(($) => $.page.empty.title)}</p>
            <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
              {t(($) => $.page.empty.hint)}
            </p>
            <div className="mt-7 grid w-full grid-cols-1 gap-1 rounded-3xl border border-border/55 bg-card/70 p-2 shadow-sm ring-1 ring-black/[0.02] sm:grid-cols-2">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    className="group flex min-h-16 items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-accent/45"
                    onClick={() => openCreate(tpl)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {t(($) => $.templates[tpl.id].title)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {t(($) => $.templates[tpl.id].summary)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-4 rounded-full px-3"
              onClick={() => openCreate()}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t(($) => $.page.start_blank)}
            </Button>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* Column headers */}
            <div className="sticky top-0 z-[1] hidden h-10 items-center gap-2 border-b bg-muted/25 px-5 text-xs font-medium text-muted-foreground sm:flex">
              <span className="shrink-0 w-4" />
              <span className="min-w-0 flex-1">{t(($) => $.page.table.name)}</span>
              <span className="w-32 shrink-0">{t(($) => $.page.table.agent)}</span>
              <span className="w-24 text-center shrink-0">{t(($) => $.page.table.mode)}</span>
              <span className="w-20 text-center shrink-0">{t(($) => $.page.table.status)}</span>
              <span className="w-20 text-right shrink-0">{t(($) => $.page.table.last_run)}</span>
            </div>
            {autopilots.map((autopilot) => (
              <AutopilotRow key={autopilot.id} autopilot={autopilot} />
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <AutopilotDialog
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          initial={
            selectedTemplate
              ? {
                  title: t(($) => $.templates[selectedTemplate.id].title),
                  description: t(($) => $.templates[selectedTemplate.id].prompt),
                }
              : undefined
          }
          initialTriggerConfig={
            selectedTemplate
              ? { frequency: selectedTemplate.frequency, time: selectedTemplate.time }
              : undefined
          }
        />
      )}
    </div>
  );
}
