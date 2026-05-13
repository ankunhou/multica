"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type {
  Agent,
  AgentRuntime,
  AgentTask,
  MemberWithUser,
} from "@multica/core/types";
import { useAuthStore } from "@multica/core/auth";
import { useWorkspaceId } from "@multica/core/hooks";
import {
  agentListOptions,
  memberListOptions,
} from "@multica/core/workspace/queries";
import {
  deriveRuntimeHealth,
  latestCliVersionOptions,
} from "@multica/core/runtimes";
import { agentTaskSnapshotOptions, deriveWorkload } from "@multica/core/agents";
import { paths, useWorkspaceSlug } from "@multica/core/paths";
import { DataTable } from "@multica/ui/components/ui/data-table";
import {
  ResourceInteractiveRegion,
  ResourceSurface,
  type ResourceViewMode,
} from "../../common/resource-view";
import { useNavigation } from "../../navigation";
import { ActorAvatar } from "../../common/actor-avatar";
import { workloadConfig } from "../../agents/presence";
import { ProviderLogo } from "./provider-logo";
import { HealthIcon, useHealthLabel } from "./shared";
import {
  RuntimeRowActions,
  splitRuntimeName,
  type RuntimeRow,
  createRuntimeColumns,
} from "./runtime-columns";
import { formatLastSeen, isVersionNewer } from "../utils";
import { useT } from "../../i18n";

interface RuntimeWorkload {
  agentIds: string[];
  runningCount: number;
  queuedCount: number;
}

const EMPTY_WORKLOAD: RuntimeWorkload = {
  agentIds: [],
  runningCount: 0,
  queuedCount: 0,
};

// Per-runtime workload snapshot — agent IDs serving this runtime (drives
// the avatar stack; .length doubles as the agent count) plus task counts
// split by status. Built once per render off the workspace-wide
// agents / agent-task-snapshot caches; filtered locally — no extra requests.
export function buildWorkloadIndex(
  agents: Agent[],
  tasks: AgentTask[],
): Map<string, RuntimeWorkload> {
  const result = new Map<string, RuntimeWorkload>();
  const agentToRuntime = new Map<string, string>();

  for (const a of agents) {
    if (!a.runtime_id || a.archived_at) continue;
    agentToRuntime.set(a.id, a.runtime_id);
    const entry =
      result.get(a.runtime_id) ?? {
        agentIds: [],
        runningCount: 0,
        queuedCount: 0,
      };
    entry.agentIds.push(a.id);
    result.set(a.runtime_id, entry);
  }
  for (const t of tasks) {
    const rid = agentToRuntime.get(t.agent_id);
    if (!rid) continue;
    const entry = result.get(rid);
    if (!entry) continue;
    if (t.status === "running") entry.runningCount += 1;
    else if (t.status === "queued" || t.status === "dispatched")
      entry.queuedCount += 1;
  }
  return result;
}

export function RuntimeList({
  runtimes,
  updatableIds,
  now,
  viewMode = "list",
}: {
  runtimes: AgentRuntime[];
  // Kept on the API surface for callers — the CLI column re-derives
  // update state per row via metadata.cli_version + the GitHub-release
  // query, so this prop is now unused. Left to avoid scope creep on the
  // page-level wrapper that still computes the set.
  updatableIds?: Set<string>;
  now: number;
  viewMode?: ResourceViewMode;
}) {
  void updatableIds;

  const { t } = useT("runtimes");
  const wsId = useWorkspaceId();
  const slug = useWorkspaceSlug();
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);

  const { data: agents = [] } = useQuery(agentListOptions(wsId));
  const { data: members = [] } = useQuery(memberListOptions(wsId));
  const { data: snapshot = [] } = useQuery(agentTaskSnapshotOptions(wsId));
  const { data: latestCliVersion = null } = useQuery(latestCliVersionOptions());

  const currentMember = user
    ? members.find((m) => m.user_id === user.id)
    : null;
  const isAdmin = currentMember
    ? currentMember.role === "owner" || currentMember.role === "admin"
    : false;

  const workloadIndex = useMemo(
    () => buildWorkloadIndex(agents, snapshot),
    [agents, snapshot],
  );

  const memberById = useMemo(() => {
    const map = new Map<string, MemberWithUser>();
    for (const m of members) map.set(m.user_id, m);
    return map;
  }, [members]);

  // Owner column only earns its space when the page actually has multiple
  // distinct owners — otherwise it would just be a column of identical
  // avatars.
  const showOwner = useMemo(() => {
    const owners = new Set<string>();
    for (const r of runtimes) {
      if (r.owner_id) owners.add(r.owner_id);
    }
    return owners.size > 1;
  }, [runtimes]);

  const rows = useMemo<RuntimeRow[]>(() => {
    return runtimes.map((runtime) => ({
      runtime,
      ownerMember: runtime.owner_id
        ? memberById.get(runtime.owner_id) ?? null
        : null,
      workload: workloadIndex.get(runtime.id) ?? EMPTY_WORKLOAD,
      canDelete: isAdmin || (!!user && runtime.owner_id === user.id),
    }));
  }, [runtimes, memberById, workloadIndex, isAdmin, user]);

  const columns = useMemo(
    () =>
      createRuntimeColumns({
        showOwner,
        latestCliVersion,
        wsId,
        now,
        t,
      }),
    [showOwner, latestCliVersion, wsId, now, t],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    // Pin the kebab column right so it stays accessible during horizontal
    // scroll — matches the pattern in Linear / Notion / GitHub.
    initialState: { columnPinning: { right: ["actions"] } },
  });

  if (viewMode === "grid") {
    return (
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rows.map((row) => (
          <RuntimeCard
            key={row.runtime.id}
            row={row}
            wsId={wsId}
            slug={slug}
            now={now}
            latestCliVersion={latestCliVersion}
            showOwner={showOwner}
          />
        ))}
      </div>
    );
  }

  return (
    <DataTable
      variant="resource"
      table={table}
      onRowClick={(row) => {
        if (!slug) return;
        navigation.push(
          paths.workspace(slug).runtimeDetail(row.original.runtime.id),
        );
      }}
    />
  );
}

function RuntimeCard({
  row,
  wsId,
  slug,
  now,
  latestCliVersion,
  showOwner,
}: {
  row: RuntimeRow;
  wsId: string;
  slug: string | null;
  now: number;
  latestCliVersion: string | null;
  showOwner: boolean;
}) {
  const { t } = useT("runtimes");
  const { t: tAgents } = useT("agents");
  const navigation = useNavigation();
  const labelOf = useHealthLabel();
  const href = slug
    ? paths.workspace(slug).runtimeDetail(row.runtime.id)
    : null;
  const { base: baseName, hostname } = splitRuntimeName(row.runtime.name);
  const health = deriveRuntimeHealth(row.runtime, now);
  const lastSeen = formatLastSeen(row.runtime.last_seen_at);
  const offline = health === "offline" || health === "about_to_gc";
  const workload = deriveWorkload({
    runningCount: row.workload.runningCount,
    queuedCount: row.workload.queuedCount,
  });
  const workloadVisual = workloadConfig[workload];
  const WorkloadIcon = workloadVisual.icon;
  const meta = row.runtime.metadata as Record<string, unknown> | null;
  const cliVersion =
    meta && typeof meta.cli_version === "string" ? meta.cli_version : null;
  const launchedBy =
    meta && typeof meta.launched_by === "string" ? meta.launched_by : null;
  const hasCliUpdate =
    launchedBy !== "desktop" &&
    !!latestCliVersion &&
    !!cliVersion &&
    isVersionNewer(latestCliVersion, cliVersion);

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || !href) return;
      if (
        (event.metaKey || event.ctrlKey || event.shiftKey) &&
        navigation.openInNewTab
      ) {
        navigation.openInNewTab(href);
        return;
      }
      navigation.push(href);
    },
    [href, navigation],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.defaultPrevented || !href) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      navigation.push(href);
    },
    [href, navigation],
  );

  return (
    <ResourceSurface
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className="flex min-h-52 cursor-pointer flex-col p-4 transition-colors hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted/65">
            <ProviderLogo provider={row.runtime.provider} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="truncate text-sm font-medium">{baseName}</span>
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
                {row.runtime.visibility === "public"
                  ? t(($) => $.detail.visibility_label.public)
                  : t(($) => $.detail.visibility_label.private)}
              </span>
            </div>
            {hostname && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {hostname}
              </p>
            )}
          </div>
        </div>
        <ResourceInteractiveRegion>
          <RuntimeRowActions
            runtime={row.runtime}
            wsId={wsId}
            canDelete={row.canDelete}
          />
        </ResourceInteractiveRegion>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/45 px-2.5 py-1 text-xs">
          <HealthIcon health={health} />
          <span>{labelOf(health)}</span>
          {health !== "online" && row.runtime.last_seen_at && (
            <span className="text-muted-foreground">· {lastSeen}</span>
          )}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/45 px-2.5 py-1 text-xs text-muted-foreground">
          {offline ? (
            <span>—</span>
          ) : (
            <>
              {workload !== "idle" && (
                <WorkloadIcon
                  className={`h-3 w-3 shrink-0 ${workloadVisual.textClass} ${
                    workload === "working" ? "animate-spin" : ""
                  }`}
                />
              )}
              <span className={workloadVisual.textClass}>
                {tAgents(($) => $.workload[workload])}
              </span>
              {workload === "working" && (
                <span className="font-mono tabular-nums">
                  {row.workload.runningCount}
                </span>
              )}
              {workload === "queued" && (
                <span className="font-mono tabular-nums">
                  {row.workload.queuedCount}
                </span>
              )}
            </>
          )}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        <div className="min-w-0 rounded-2xl bg-muted/35 px-3 py-2">
          <div className="text-muted-foreground">{t(($) => $.list.col_agents)}</div>
          <RuntimeCardAgentStack agentIds={row.workload.agentIds} />
        </div>
        <div className="min-w-0 rounded-2xl bg-muted/35 px-3 py-2">
          <div className="text-muted-foreground">{t(($) => $.list.col_cli)}</div>
          <div
            className={`mt-2 truncate font-mono text-xs ${
              hasCliUpdate ? "text-warning" : "text-foreground"
            }`}
          >
            {cliVersion ?? "—"}
          </div>
        </div>
      </div>

      {showOwner && row.ownerMember && (
        <div className="mt-auto flex min-w-0 items-center gap-2 pt-5 text-xs text-muted-foreground">
          <ActorAvatar
            actorType="member"
            actorId={row.ownerMember.user_id}
            size={18}
          />
          <span className="truncate">{row.ownerMember.name}</span>
        </div>
      )}
    </ResourceSurface>
  );
}

function RuntimeCardAgentStack({ agentIds }: { agentIds: string[] }) {
  if (agentIds.length === 0) {
    return <div className="mt-2 text-xs text-muted-foreground/50">—</div>;
  }
  const visible = agentIds.slice(0, 3);
  const extra = agentIds.length - visible.length;
  return (
    <div className="mt-2 flex items-center -space-x-1.5">
      {visible.map((id) => (
        <span
          key={id}
          className="inline-flex rounded-full ring-2 ring-background"
        >
          <ActorAvatar
            actorType="agent"
            actorId={id}
            size={22}
            enableHoverCard
          />
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground ring-2 ring-background">
          +{extra}
        </span>
      )}
    </div>
  );
}
