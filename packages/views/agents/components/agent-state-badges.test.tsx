// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@multica/core/i18n/react";
import type { AgentPresenceDetail } from "@multica/core/agents";
import enAgents from "../../locales/en/agents.json";
import { AgentAvailabilityBadge, AgentWorkloadBadge } from "./agent-state-badges";

const TEST_RESOURCES = { en: { agents: enAgents } };

function renderWithI18n(ui: ReactNode) {
  return render(
    <I18nProvider locale="en" resources={TEST_RESOURCES}>
      {ui}
    </I18nProvider>,
  );
}

function presence(overrides: Partial<AgentPresenceDetail>): AgentPresenceDetail {
  return {
    availability: "online",
    workload: "idle",
    runningCount: 0,
    queuedCount: 0,
    capacity: 3,
    ...overrides,
  };
}

describe("agent state badges", () => {
  it("tones online queued workload as transient", () => {
    renderWithI18n(
      <AgentWorkloadBadge detail={presence({ workload: "queued", queuedCount: 2 })} />,
    );

    expect(screen.getByText("Queued")).toHaveClass("text-muted-foreground");
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("tones offline queued workload as a warning", () => {
    renderWithI18n(
      <AgentWorkloadBadge
        detail={presence({
          availability: "offline",
          workload: "queued",
          queuedCount: 2,
        })}
      />,
    );

    expect(screen.getByText("Queued")).toHaveClass("text-agent-queued");
  });

  it("keeps compact availability accessible with a combined title", () => {
    renderWithI18n(
      <AgentAvailabilityBadge
        detail={presence({ workload: "working", runningCount: 1 })}
        compact
      />,
    );

    expect(screen.getByTitle("Online · Working")).toBeInTheDocument();
  });

  it("uses agent semantic tokens for availability", () => {
    renderWithI18n(<AgentAvailabilityBadge detail={presence({ availability: "online" })} />);

    expect(screen.getByText("Online")).toHaveClass("text-agent-available");
  });
});
