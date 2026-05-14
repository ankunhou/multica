"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  File,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
  Monitor,
  Sparkles,
  UserMinus,
} from "lucide-react";
import { cn } from "@multica/ui/lib/utils";
import { ImageIcon } from "./shared";
import { useLocale } from "../i18n";
import type { LandingDict } from "../i18n";
import { StatusIcon, PriorityIcon } from "@multica/views/issues/components";
import type { IssueStatus, IssuePriority } from "@multica/core/types";

/* ------------------------------------------------------------------ */
/*  Mock ActorAvatar — mirrors the real ActorAvatar styling exactly     */
/*  but uses hardcoded data instead of the workspace store             */
/* ------------------------------------------------------------------ */

function MockAvatar({
  type,
  initials,
  size = 20,
}: {
  type: "member" | "agent";
  initials?: string;
  size?: number;
}) {
  return (
    <div
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium overflow-hidden bg-muted text-muted-foreground"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {type === "agent" ? <Bot style={{ width: size * 0.55, height: size * 0.55 }} /> : initials}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock PropRow — mirrors the real PropRow from issue-detail           */
/* ------------------------------------------------------------------ */

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-8 items-center gap-2 rounded-md px-2 -mx-2">
      <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs truncate">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Teammates feature visual                                           */
/* ------------------------------------------------------------------ */

type Assignee = {
  type: "member" | "agent" | null;
  id: string | null;
  name: string;
  initials?: string;
};

const allAssignees: Assignee[] = [
  { type: null, id: null, name: "" },
  { type: "member", id: "ar", name: "Alex Rivera", initials: "AR" },
  { type: "member", id: "sk", name: "Sarah Kim", initials: "SK" },
  { type: "agent", id: "claude", name: "Claude" },
  { type: "agent", id: "tina", name: "Tina-dev" },
];

type DemoIssueStatus = Extract<
  IssueStatus,
  "backlog" | "todo" | "in_progress" | "in_review" | "done"
>;

const statusCycle: DemoIssueStatus[] = ["backlog", "todo", "in_progress", "in_review", "done"];
const priorityCycle: IssuePriority[] = ["none", "low", "medium", "high", "urgent"];

function TeammatesVisual() {
  const { t } = useLocale();
  const copy = t.featureVisuals;
  const [status, setStatus] = useState<DemoIssueStatus>("in_progress");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [assignee, setAssignee] = useState<Assignee>(allAssignees[3]!); // Claude
  const [pickerOpen, setPickerOpen] = useState(true);
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const timeline = [
    {
      type: "activity" as const,
      actorType: "member" as const,
      initials: "AR",
      name: "Alex Rivera",
      action: copy.teammates.assignedToClaude,
      time: "3:02 PM",
      statusIcon: null,
    },
    {
      type: "activity" as const,
      actorType: "agent" as const,
      initials: "",
      name: "Claude",
      action: copy.teammates.statusChanged,
      time: "3:02 PM",
      statusIcon: "in_progress" as const,
    },
    {
      type: "comment" as const,
      actorType: "member" as const,
      initials: "AR",
      name: "Alex Rivera",
      time: "10 min",
      content: copy.teammates.comments[0]!,
    },
    {
      type: "comment" as const,
      actorType: "agent" as const,
      initials: "",
      name: "Claude",
      time: "6 min",
      content: copy.teammates.comments[1]!,
    },
    {
      type: "comment" as const,
      actorType: "member" as const,
      initials: "AR",
      name: "Alex Rivera",
      time: "3 min",
      content: copy.teammates.comments[2]!,
    },
  ];

  const cycleStatus = () => {
    const idx = statusCycle.indexOf(status);
    setStatus(statusCycle[(idx + 1) % statusCycle.length]!);
  };

  const cyclePriority = () => {
    const idx = priorityCycle.indexOf(priority);
    setPriority(priorityCycle[(idx + 1) % priorityCycle.length]!);
  };

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl">
      {/* Header bar */}
      <div className="flex h-10 shrink-0 items-center border-b bg-background px-4 text-sm">
        <div className="flex items-center gap-1.5 min-w-0 text-xs">
          <span className="text-muted-foreground">{copy.common.demo}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          <span className="text-muted-foreground">MUL-18</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          <span className="truncate">{copy.common.issueTitle}</span>
        </div>
      </div>

      <div className="flex h-[calc(100%-40px)]">
        {/* Main content area */}
        <div className="flex-1 overflow-hidden px-8 py-5">
          <h3 className="text-lg font-bold leading-snug tracking-tight">
            {copy.common.issueTitle}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{copy.common.issueDescription}</p>

          <div className="my-4 border-t" />

          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">{copy.teammates.activity}</h4>
            <span className="text-xs text-muted-foreground">{copy.teammates.subscribe}</span>
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            {timeline.map((entry, i) => {
              if (entry.type === "activity") {
                return (
                  <div key={i} className="px-4 flex items-center text-xs text-muted-foreground">
                    <div className="mr-2 flex w-4 shrink-0 justify-center">
                      {entry.statusIcon ? (
                        <StatusIcon status={entry.statusIcon} className="h-4 w-4 shrink-0" />
                      ) : (
                        <MockAvatar type={entry.actorType} initials={entry.initials} size={16} />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <span className="shrink-0 font-medium">{entry.name}</span>
                      <span className="truncate">{entry.action}</span>
                      <span className="ml-auto shrink-0">{entry.time}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="rounded-lg border bg-card px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <MockAvatar type={entry.actorType} initials={entry.initials} size={22} />
                    <span className="text-sm font-medium">{entry.name}</span>
                    <span className="text-xs text-muted-foreground">{entry.time}</span>
                  </div>
                  <p className="mt-1 pl-8 text-sm leading-relaxed text-muted-foreground">
                    {entry.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Properties sidebar */}
        <div className="w-[220px] shrink-0 overflow-hidden border-l">
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-1 text-xs font-medium mb-2">
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground rotate-90" />
                {copy.teammates.properties}
              </div>
              <div className="space-y-0.5 pl-2">
                {/* Status — clickable with dropdown */}
                <div className="relative">
                  <PropRow label={copy.teammates.status}>
                    <button
                      className="flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 hover:bg-accent/30 transition-colors"
                      onClick={() => {
                        setStatusOpen(!statusOpen);
                        setPriorityOpen(false);
                      }}
                    >
                      <StatusIcon status={status} className="h-3.5 w-3.5 shrink-0" />
                      <span>{copy.common.status[status]}</span>
                    </button>
                  </PropRow>
                  {statusOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-md border bg-popover shadow-md">
                      {statusCycle.map((s) => (
                        <button
                          key={s}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors",
                            s === status && "bg-accent",
                          )}
                          onClick={() => {
                            setStatus(s);
                            setStatusOpen(false);
                          }}
                        >
                          <StatusIcon status={s} className="h-3.5 w-3.5 shrink-0" />
                          {copy.common.status[s]}
                          {s === status && <Check className="ml-auto h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority — clickable with dropdown */}
                <div className="relative">
                  <PropRow label={copy.teammates.priority}>
                    <button
                      className="flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 hover:bg-accent/30 transition-colors"
                      onClick={() => {
                        setPriorityOpen(!priorityOpen);
                        setStatusOpen(false);
                      }}
                    >
                      <PriorityIcon priority={priority} />
                      <span>{copy.common.priority[priority]}</span>
                    </button>
                  </PropRow>
                  {priorityOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-md border bg-popover shadow-md">
                      {priorityCycle.map((p) => (
                        <button
                          key={p}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent transition-colors",
                            p === priority && "bg-accent",
                          )}
                          onClick={() => {
                            setPriority(p);
                            setPriorityOpen(false);
                          }}
                        >
                          <PriorityIcon priority={p} />
                          {copy.common.priority[p]}
                          {p === priority && <Check className="ml-auto h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assignee — clickable to toggle picker */}
                <PropRow label={copy.teammates.assignee}>
                  <button
                    className="flex items-center gap-1.5 cursor-pointer rounded px-1 -mx-1 hover:bg-accent/30 transition-colors"
                    onClick={() => {
                      setPickerOpen(!pickerOpen);
                      setStatusOpen(false);
                      setPriorityOpen(false);
                    }}
                  >
                    {assignee.type ? (
                      <>
                        <MockAvatar type={assignee.type} initials={assignee.initials} size={18} />
                        <span>{assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">{copy.teammates.unassigned}</span>
                    )}
                  </button>
                </PropRow>
              </div>
            </div>

            {/* Assignee picker — togglable */}
            {pickerOpen && (
              <div className="overflow-hidden rounded-md border bg-popover shadow-md">
                <div className="border-b px-3 py-1.5 text-xs text-muted-foreground">
                  {copy.teammates.assignTo}
                </div>
                <div className="p-1">
                  <button
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors",
                      !assignee.type && "bg-accent",
                    )}
                    onClick={() => {
                      setAssignee(allAssignees[0]!);
                      setPickerOpen(false);
                    }}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    <span>{copy.teammates.unassigned}</span>
                    {!assignee.type && <Check className="ml-auto h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="px-3 py-0.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {copy.teammates.members}
                  </span>
                </div>
                <div className="p-1 pt-0">
                  {allAssignees
                    .filter((a) => a.type === "member")
                    .map((m) => (
                      <button
                        key={m.id}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-xs hover:bg-accent transition-colors",
                          assignee.id === m.id && "bg-accent",
                        )}
                        onClick={() => {
                          setAssignee(m);
                          setPickerOpen(false);
                        }}
                      >
                        <MockAvatar type="member" initials={m.initials} size={16} />
                        <span>{m.name}</span>
                        {assignee.id === m.id && <Check className="ml-auto h-3.5 w-3.5" />}
                      </button>
                    ))}
                </div>
                <div className="px-3 py-0.5">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {copy.teammates.agents}
                  </span>
                </div>
                <div className="p-1 pt-0">
                  {allAssignees
                    .filter((a) => a.type === "agent")
                    .map((a) => (
                      <button
                        key={a.id}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-1 text-xs hover:bg-accent transition-colors",
                          assignee.id === a.id && "bg-accent",
                        )}
                        onClick={() => {
                          setAssignee(a);
                          setPickerOpen(false);
                        }}
                      >
                        <div className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-info/10 text-info">
                          <Bot className="size-2.5" />
                        </div>
                        <span>{a.name}</span>
                        {assignee.id === a.id && <Check className="ml-auto h-3.5 w-3.5" />}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Autonomous feature visual — agent live execution card               */
/* ------------------------------------------------------------------ */

function AutonomousVisual() {
  const { t } = useLocale();
  const copy = t.featureVisuals;
  const [expanded, setExpanded] = useState<number | null>(null);
  const toolCalls = [
    { type: "thinking" as const, content: copy.autonomous.toolTimeline.analyzing },
    { type: "tool_use" as const, tool: "Read", summary: "server/internal/handler/issue.go" },
    { type: "tool_result" as const, preview: copy.autonomous.toolTimeline.issuePreview },
    { type: "tool_use" as const, tool: "Edit", summary: copy.autonomous.toolTimeline.editIssue },
    { type: "tool_result" as const, preview: copy.autonomous.toolTimeline.updatedErrors },
    { type: "thinking" as const, content: copy.autonomous.toolTimeline.checkingComments },
    { type: "tool_use" as const, tool: "Read", summary: "server/internal/handler/comment.go" },
    { type: "tool_result" as const, preview: copy.autonomous.toolTimeline.commentPreview },
    {
      type: "tool_use" as const,
      tool: "Bash",
      summary: "go test ./internal/handler/ -run TestErrorResponses",
    },
    { type: "tool_result" as const, preview: copy.autonomous.toolTimeline.testsPassed },
  ];
  const taskHistory = [
    {
      status: "completed" as const,
      title: copy.autonomous.historyItems.setupTypes,
      duration: "2m 14s",
    },
    {
      status: "completed" as const,
      title: copy.autonomous.historyItems.migrateIssue,
      duration: "3m 41s",
    },
    {
      status: "running" as const,
      title: copy.autonomous.historyItems.migrateComment,
      duration: "1m 22s",
    },
  ];

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl">
      {/* Header bar */}
      <div className="flex h-10 shrink-0 items-center border-b bg-background px-4 text-sm">
        <div className="flex items-center gap-1.5 min-w-0 text-xs">
          <span className="text-muted-foreground">{copy.common.demo}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          <span className="text-muted-foreground">MUL-18</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          <span className="truncate">{copy.common.issueTitle}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-8 py-5">
        {/* Agent live card */}
        <div className="rounded-lg border border-info/20 bg-info/5">
          {/* Live card header */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-info/10 text-info">
              <Bot className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Loader2 className="h-3 w-3 animate-spin text-info" />
              {copy.autonomous.working}
            </div>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">7m 17s</span>
            <span className="text-xs text-muted-foreground">{copy.autonomous.toolCalls}</span>
          </div>

          {/* Tool call timeline */}
          <div className="max-h-48 overflow-hidden px-3 pb-2 space-y-0.5">
            {toolCalls.map((item, i) => {
              const isExpanded = expanded === i;

              if (item.type === "thinking") {
                return (
                  <button
                    key={i}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-info/5 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90",
                      )}
                    />
                    <Brain className="h-3 w-3 shrink-0 text-info/60" />
                    <span className="truncate italic text-muted-foreground">{item.content}</span>
                  </button>
                );
              }

              if (item.type === "tool_use") {
                return (
                  <button
                    key={i}
                    className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-info/5 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90",
                      )}
                    />
                    <span className="shrink-0 font-semibold">{item.tool}</span>
                    <span className="truncate text-muted-foreground">{item.summary}</span>
                  </button>
                );
              }

              /* tool_result */
              return (
                <button
                  key={i}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : i)}
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90",
                    )}
                  />
                  <span className="shrink-0 text-muted-foreground">{copy.autonomous.result}</span>
                  <span className="truncate text-muted-foreground">{item.preview}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Task run history */}
        <div className="mt-4">
          <span className="text-xs font-medium text-muted-foreground">
            {copy.autonomous.history}
          </span>
          <div className="mt-2 space-y-1.5">
            {taskHistory.map((task, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {task.status === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                ) : (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-info" />
                )}
                <span
                  className={task.status === "running" ? "font-medium" : "text-muted-foreground"}
                >
                  {task.title}
                </span>
                <span className="ml-auto text-muted-foreground tabular-nums">{task.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skills feature visual — skill library + file browser               */
/* ------------------------------------------------------------------ */

const mockFileTree = [
  { name: "SKILL.md", isDir: false, depth: 0, icon: "md" as const },
  { name: "config", isDir: true, depth: 0, open: true },
  { name: "schema.sql", isDir: false, depth: 1, icon: "file" as const },
  { name: "templates", isDir: true, depth: 0, open: false },
];

function SkillsVisual() {
  const { t } = useLocale();
  const copy = t.featureVisuals;
  const [selectedSkill, setSelectedSkill] = useState(1);
  const [selectedFile, setSelectedFile] = useState("SKILL.md");
  const skills = [
    { ...copy.skills.items.deploy, files: 3 },
    { ...copy.skills.items.migration, files: 4 },
    { ...copy.skills.items.review, files: 2 },
    { ...copy.skills.items.tests, files: 3 },
  ];

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl">
      <div className="flex h-full">
        {/* Skills list panel */}
        <div className="w-[200px] shrink-0 border-r flex flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-semibold">{copy.skills.title}</span>
            <button className="rounded p-0.5 text-muted-foreground hover:bg-accent transition-colors">
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden divide-y">
            {skills.map((skill, i) => (
              <button
                key={skill.name}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                  i === selectedSkill ? "bg-accent" : "hover:bg-accent/50",
                )}
                onClick={() => setSelectedSkill(i)}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{skill.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {skill.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skill detail */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Skill header */}
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium">{skills[selectedSkill]?.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {skills[selectedSkill]?.description}
            </span>
          </div>

          {/* File browser */}
          <div className="flex flex-1 min-h-0">
            {/* File tree */}
            <div className="w-44 shrink-0 border-r">
              <div className="flex items-center justify-between border-b px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {copy.skills.files}
                </span>
              </div>
              <div className="py-1">
                {mockFileTree.map((f) => (
                  <button
                    key={f.name}
                    className={cn(
                      "flex w-full items-center gap-1.5 py-1 text-xs transition-colors",
                      selectedFile === f.name && !f.isDir
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50",
                    )}
                    style={{ paddingLeft: f.isDir ? f.depth * 12 + 8 : f.depth * 12 + 24 }}
                    onClick={() => {
                      if (!f.isDir) setSelectedFile(f.name);
                    }}
                  >
                    {f.isDir ? (
                      <>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 shrink-0 transition-transform",
                            f.open && "rotate-90",
                          )}
                        />
                        {f.open ? (
                          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </>
                    ) : f.icon === "md" ? (
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* File content viewer */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex h-8 items-center border-b px-3">
                <span className="text-xs font-mono text-muted-foreground">{selectedFile}</span>
              </div>
              <div className="flex-1 overflow-hidden p-4">
                {selectedFile === "SKILL.md" ? (
                  <div className="space-y-3 text-xs">
                    {/* Frontmatter */}
                    <div className="rounded-md border bg-muted/30 p-3">
                      <div className="grid grid-cols-[80px_1fr] gap-y-1">
                        <span className="font-medium text-muted-foreground">name</span>
                        <span>write-migration</span>
                        <span className="font-medium text-muted-foreground">version</span>
                        <span>1.2.0</span>
                        <span className="font-medium text-muted-foreground">author</span>
                        <span>Alex Rivera</span>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="space-y-2 text-muted-foreground leading-relaxed">
                      <p className="font-semibold text-foreground">{copy.skills.doc.title}</p>
                      <p>{copy.skills.doc.description}</p>
                      <p className="font-medium text-foreground">{copy.skills.doc.stepsTitle}</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        {copy.skills.doc.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs font-mono text-muted-foreground">
                    {`CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  issue_id UUID REFERENCES issues(id),
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);`}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Runtimes feature visual — agent dashboard with runtime status      */
/* ------------------------------------------------------------------ */

const mockRuntimeList = [
  {
    name: "MacBook Pro",
    mode: "local" as const,
    status: "online" as const,
    device: "arm64 / macOS 15.2",
    lastSeen: "Just now",
  },
  {
    name: "Cloud (Anthropic)",
    mode: "cloud" as const,
    status: "online" as const,
    device: "api.anthropic.com",
    lastSeen: "Just now",
  },
  {
    name: "Linux Server",
    mode: "local" as const,
    status: "offline" as const,
    device: "x86_64 / Ubuntu 24.04",
    lastSeen: "3h ago",
  },
];

/* Mock usage data — deterministic seed values to avoid SSR/hydration mismatch */
const USAGE_SEEDS = [
  [72, 38, 54, 12],
  [45, 22, 41, 8],
  [88, 44, 63, 15],
  [61, 31, 48, 10],
  [93, 47, 58, 14],
  [55, 28, 39, 9],
  [79, 40, 52, 13],
  [67, 34, 46, 11],
  [84, 42, 60, 14],
  [50, 25, 35, 7],
  [91, 46, 57, 13],
  [58, 29, 43, 10],
  [76, 38, 51, 12],
  [63, 32, 44, 9],
  [87, 44, 59, 14],
  [52, 26, 37, 8],
  [95, 48, 62, 15],
  [70, 35, 49, 11],
  [82, 41, 55, 13],
  [48, 24, 33, 7],
  [89, 45, 61, 14],
  [65, 33, 47, 10],
  [78, 39, 53, 12],
  [56, 28, 40, 9],
  [92, 46, 58, 14],
  [60, 30, 42, 8],
  [85, 43, 56, 13],
  [73, 37, 50, 11],
  [80, 40, 54, 12],
  [68, 34, 45, 10],
];
const mockUsageData = USAGE_SEEDS.map((s, i) => ({
  date: `2026-03-${String(i + 2).padStart(2, "0")}`,
  input_tokens: s[0]! * 1000,
  output_tokens: s[1]! * 1000,
  cache_read_tokens: s[2]! * 1000,
  cache_write_tokens: s[3]! * 1000,
}));

/* Heatmap color helper — same as real ActivityHeatmap */
function getHeatmapColor(level: number): string {
  if (level === 0) return "var(--color-muted)";
  const opacities = ["25%", "45%", "68%", "90%"];
  return `color-mix(in oklch, var(--color-foreground) ${opacities[level - 1]}, transparent)`;
}

/* Generate heatmap cells — simplified version of real ActivityHeatmap */
function buildHeatmapCells() {
  const WEEKS = 13;
  const cells: { week: number; day: number; level: number; date: string }[] = [];
  const today = new Date();
  const todayDay = today.getDay();
  const startOffset = todayDay + (WEEKS - 1) * 7;
  // Deterministic pseudo-random sequence based on cell index
  const seed = [3, 1, 4, 2, 0, 3, 2, 4, 1, 3, 0, 2, 4, 1, 3, 2, 0, 4, 1, 3];

  for (let i = 0; i <= startOffset; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (startOffset - i));
    const week = Math.floor(i / 7);
    const day = d.getDay();
    // Weekends (0=Sun, 6=Sat) get lower activity
    const isWeekend = day === 0 || day === 6;
    const level = isWeekend ? (seed[i % seed.length]! > 2 ? 1 : 0) : seed[i % seed.length]!;
    cells.push({ week, day, level, date: d.toISOString().slice(0, 10) });
  }
  return cells;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function DailyCostBars({ data }: { data: typeof mockUsageData }) {
  const costs = data.map(
    (d) =>
      (d.input_tokens * 3 +
        d.output_tokens * 15 +
        d.cache_read_tokens * 0.3 +
        d.cache_write_tokens * 3.75) /
      1_000_000,
  );
  const maxCost = Math.max(...costs);
  const chartH = 64;
  return (
    <svg
      viewBox={`0 0 ${data.length * 10} ${chartH}`}
      className="h-[72px] w-full"
      preserveAspectRatio="none"
    >
      {costs.map((cost, i) => {
        const h = maxCost > 0 ? (cost / maxCost) * (chartH - 4) : 0;
        return (
          <rect
            key={data[i]!.date}
            x={i * 10 + 1}
            y={chartH - Math.max(h, 2)}
            width={8}
            height={Math.max(h, 2)}
            rx={1}
            fill="var(--color-chart-1)"
          />
        );
      })}
    </svg>
  );
}

function RuntimesVisual() {
  const { t } = useLocale();
  const copy = t.featureVisuals;
  const [selectedRuntime, setSelectedRuntime] = useState(0);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [heatmapCells, setHeatmapCells] = useState<ReturnType<typeof buildHeatmapCells>>([]);
  const rangeLabels = {
    "7d": copy.runtimes.range7d,
    "30d": copy.runtimes.range30d,
    "90d": copy.runtimes.range90d,
  };
  const runtimeStatusLabels = {
    online: copy.runtimes.online,
    offline: copy.runtimes.offline,
  };

  useEffect(() => {
    setHeatmapCells(buildHeatmapCells());
  }, []);

  const totals = mockUsageData.reduce(
    (acc, u) => ({
      input: acc.input + u.input_tokens,
      output: acc.output + u.output_tokens,
      cacheRead: acc.cacheRead + u.cache_read_tokens,
      cacheWrite: acc.cacheWrite + u.cache_write_tokens,
    }),
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  );

  const CELL_SIZE = 10;
  const CELL_GAP = 2;
  const WEEKS = 13;
  const labelWidth = 24;
  const svgWidth = labelWidth + WEEKS * (CELL_SIZE + CELL_GAP);
  const svgHeight = 12 + 7 * (CELL_SIZE + CELL_GAP);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border bg-background text-foreground shadow-2xl">
      <div className="flex h-full">
        {/* Runtime list */}
        <div className="w-[200px] shrink-0 border-r flex flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-xs font-semibold">{copy.runtimes.title}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {mockRuntimeList.map((rt, i) => (
              <button
                key={rt.name}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2.5 transition-colors",
                  i === selectedRuntime ? "bg-accent" : "hover:bg-accent/50",
                )}
                onClick={() => setSelectedRuntime(i)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {rt.mode === "cloud" ? (
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium">{rt.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        rt.status === "online" ? "bg-success" : "bg-muted-foreground/40",
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {runtimeStatusLabels[rt.status]}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
              {mockRuntimeList[selectedRuntime]?.mode === "cloud" ? (
                <Cloud className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Monitor className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="text-sm font-semibold">{mockRuntimeList[selectedRuntime]?.name}</span>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  mockRuntimeList[selectedRuntime]?.status === "online"
                    ? "bg-success"
                    : "bg-muted-foreground/40",
                )}
              />
              <span className="text-xs text-muted-foreground">
                {mockRuntimeList[selectedRuntime]?.status
                  ? runtimeStatusLabels[mockRuntimeList[selectedRuntime].status]
                  : ""}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {mockRuntimeList[selectedRuntime]?.device}
            </span>
          </div>

          {/* Usage content */}
          <div className="flex-1 overflow-hidden p-4 space-y-3">
            {/* Time range + Token cards */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(["7d", "30d", "90d"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                      timeRange === range
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {rangeLabels[range]}
                  </button>
                ))}
              </div>
            </div>

            {/* Token summary cards — same as real TokenCard */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: copy.runtimes.input, value: formatTokens(totals.input) },
                { label: copy.runtimes.output, value: formatTokens(totals.output) },
                { label: copy.runtimes.cacheRead, value: formatTokens(totals.cacheRead) },
                { label: copy.runtimes.cacheWrite, value: formatTokens(totals.cacheWrite) },
              ].map((card) => (
                <div key={card.label} className="rounded-lg border px-3 py-2">
                  <div className="text-[10px] text-muted-foreground">{card.label}</div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums">{card.value}</div>
                </div>
              ))}
            </div>

            {/* Charts row — Heatmap + Hourly bar */}
            <div className="grid grid-cols-2 gap-3">
              {/* Activity Heatmap — mirrors real ActivityHeatmap */}
              <div className="rounded-lg border p-3">
                <h4 className="text-[10px] font-medium text-muted-foreground mb-2">
                  {copy.runtimes.activity}
                </h4>
                <div className="overflow-x-auto">
                  <svg width={svgWidth} height={svgHeight} className="block">
                    {[
                      "",
                      copy.runtimes.weekdays.mon,
                      "",
                      copy.runtimes.weekdays.wed,
                      "",
                      copy.runtimes.weekdays.fri,
                      "",
                    ].map((label, i) =>
                      label ? (
                        <text
                          key={i}
                          x={0}
                          y={12 + i * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                          className="fill-muted-foreground"
                          fontSize={8}
                        >
                          {label}
                        </text>
                      ) : null,
                    )}
                    {heatmapCells.map((c, i) => (
                      <rect
                        key={i}
                        x={labelWidth + c.week * (CELL_SIZE + CELL_GAP)}
                        y={12 + c.day * (CELL_SIZE + CELL_GAP)}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx={2}
                        fill={getHeatmapColor(c.level)}
                      />
                    ))}
                  </svg>
                </div>
                <div className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
                  <span>{copy.runtimes.less}</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-[8px] w-[8px] rounded-[2px]"
                      style={{ backgroundColor: getHeatmapColor(level) }}
                    />
                  ))}
                  <span>{copy.runtimes.more}</span>
                </div>
              </div>

              {/* Daily Cost — SVG bar chart mirroring real DailyCostChart */}
              <div className="rounded-lg border p-3">
                <h4 className="text-[10px] font-medium text-muted-foreground mb-2">
                  {copy.runtimes.dailyCost}
                </h4>
                <DailyCostBars data={mockUsageData.slice(-14)} />
                <div className="mt-1.5 flex justify-between text-[8px] text-muted-foreground">
                  <span>{copy.runtimes.dateMar18}</span>
                  <span>{copy.runtimes.dateMar25}</span>
                  <span>{copy.runtimes.dateMar31}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildFeatures(t: LandingDict) {
  const keys = ["teammates", "autonomous", "skills", "runtimes"] as const;
  const visuals = [TeammatesVisual, AutonomousVisual, SkillsVisual, RuntimesVisual];
  const bgImages = [
    undefined,
    "/images/feature-bg-2.jpg",
    "/images/feature-bg-3.jpg",
    "/images/feature-bg-4.jpg",
  ];

  return keys.map((key, i) => ({
    ...t.features[key],
    visual: visuals[i]!,
    bgImage: bgImages[i],
  }));
}

export function FeaturesSection() {
  const { t } = useLocale();
  const features = buildFeatures(t);
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    panelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToPanel = (index: number) => {
    panelRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section id="features" className="bg-white text-[#0a0d12]">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="relative lg:flex lg:gap-20">
          {/* Sticky left nav */}
          <nav className="hidden lg:block lg:w-[180px] lg:shrink-0">
            <div className="sticky top-28 flex flex-col gap-0 py-28">
              {features.map((f, i) => (
                <button
                  key={f.label}
                  onClick={() => scrollToPanel(i)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[11px] font-semibold tracking-[0.12em] transition-colors",
                    i === activeIndex
                      ? "text-[#0a0d12]"
                      : "text-[#0a0d12]/36 hover:text-[#0a0d12]/60",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full transition-colors",
                      i === activeIndex ? "bg-[#0a0d12]" : "bg-transparent",
                    )}
                  />
                  {f.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Scrollable feature panels */}
          <div className="flex-1">
            {features.map((feature, i) => (
              <div
                key={feature.label}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
                data-index={i}
                className={cn(
                  "py-20 lg:py-28",
                  i < features.length - 1 && "border-b border-[#0a0d12]/8",
                )}
              >
                {/* Title + description */}
                <h2 className="font-[family-name:var(--font-serif)] text-[2.6rem] leading-[1.05] tracking-[-0.03em] text-[#0a0d12] sm:text-[3.4rem] lg:text-[4.2rem]">
                  {feature.title}
                </h2>
                <p className="mt-5 max-w-[640px] text-[15px] leading-7 text-[#0a0d12]/60 sm:text-[16px]">
                  {feature.description}
                </p>

                {/* Visual */}
                <div className="mt-14 sm:mt-18">
                  {feature.visual ? (
                    <div className="relative overflow-hidden rounded-sm">
                      <Image
                        src={feature.bgImage ?? "/images/feature-bg.jpg"}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1320px) 100vw, 1320px"
                        quality={80}
                      />
                      <div className="relative px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                        <feature.visual />
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden border border-[#0a0d12]/8 bg-[#f5f5f5]">
                      <div className="aspect-[16/9] w-full" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className="grid size-14 place-items-center rounded-2xl border border-[#0a0d12]/8 bg-white shadow-sm">
                            <ImageIcon className="size-6 text-[#0a0d12]/30" />
                          </div>
                          <p className="text-[13px] text-[#0a0d12]/36">
                            {feature.label.toLowerCase()} visual
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Feature cards */}
                <div className="mt-14 grid gap-8 sm:mt-18 md:grid-cols-3 md:gap-10">
                  {feature.cards.map((card) => (
                    <div key={card.title}>
                      <h3 className="text-[15px] font-semibold leading-snug text-[#0a0d12] sm:text-[16px]">
                        {card.title}
                      </h3>
                      <p className="mt-2.5 text-[14px] leading-[1.7] text-[#0a0d12]/56 sm:text-[15px]">
                        {card.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
