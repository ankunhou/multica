"use client";

import { useQuery } from "@tanstack/react-query";
import {
  GitPullRequest,
  GitPullRequestArrow,
  GitPullRequestClosed,
  GitMerge,
  GitPullRequestDraft,
} from "lucide-react";
import { issuePullRequestsOptions } from "@multica/core/github/queries";
import type { GitHubPullRequest, GitHubPullRequestState } from "@multica/core/types";
import { StatusIndicator } from "@multica/ui/components/ui/status-indicator";
import { useT } from "../../i18n";

const STATE_ICON: Record<
  GitHubPullRequestState,
  {
    icon: React.ComponentType<{ className?: string }>;
    tone: "success" | "muted" | "brand" | "destructive";
  }
> = {
  open: { icon: GitPullRequestArrow, tone: "success" },
  draft: { icon: GitPullRequestDraft, tone: "muted" },
  merged: { icon: GitMerge, tone: "brand" },
  closed: { icon: GitPullRequestClosed, tone: "destructive" },
};

export function PullRequestList({ issueId }: { issueId: string }) {
  const { t } = useT("issues");
  const { data, isLoading } = useQuery(issuePullRequestsOptions(issueId));
  const prs = data?.pull_requests ?? [];

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground px-2">
        {t(($) => $.detail.pull_requests_loading)}
      </p>
    );
  }
  if (prs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground px-2">{t(($) => $.detail.pull_requests_empty)}</p>
    );
  }

  return (
    <div className="space-y-1">
      {prs.map((pr) => (
        <PullRequestRow key={pr.id} pr={pr} />
      ))}
    </div>
  );
}

function PullRequestRow({ pr }: { pr: GitHubPullRequest }) {
  const { t } = useT("issues");
  const cfg = STATE_ICON[pr.state] ?? { icon: GitPullRequest, tone: "muted" as const };
  const Icon = cfg.icon;
  const label =
    pr.state === "open"
      ? t(($) => $.detail.pull_request_state_open)
      : pr.state === "draft"
        ? t(($) => $.detail.pull_request_state_draft)
        : pr.state === "merged"
          ? t(($) => $.detail.pull_request_state_merged)
          : pr.state === "closed"
            ? t(($) => $.detail.pull_request_state_closed)
            : pr.state;
  return (
    <a
      href={pr.html_url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-start gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-accent/50 transition-colors group"
    >
      <StatusIndicator
        tone={cfg.tone}
        icon={Icon}
        iconClassName="h-3.5 w-3.5"
        className="mt-0.5"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate group-hover:text-foreground">{pr.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {pr.repo_owner}/{pr.repo_name}#{pr.number} · {label}
          {pr.author_login ? ` · @${pr.author_login}` : null}
        </p>
      </div>
    </a>
  );
}
