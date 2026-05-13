// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { I18nProvider } from "@multica/core/i18n/react";
import type { ChatMessage } from "@multica/core/types";
import enAgents from "../../locales/en/agents.json";
import enChat from "../../locales/en/chat.json";
import { ChatMessageList } from "./chat-message-list";

const TEST_RESOURCES = { en: { agents: enAgents, chat: enChat } };

beforeAll(() => {
  if (!HTMLElement.prototype.scrollTo) {
    HTMLElement.prototype.scrollTo = vi.fn();
  }
});

function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale="en" resources={TEST_RESOURCES}>
        {ui}
      </I18nProvider>
    </QueryClientProvider>,
  );
}

function assistantFailure(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    chat_session_id: "session-1",
    role: "assistant",
    content: "tool exited with status 1",
    task_id: null,
    created_at: "2026-01-01T00:00:00Z",
    failure_reason: "agent_error",
    elapsed_ms: 12_000,
    ...overrides,
  };
}

describe("ChatMessageList", () => {
  it("renders task failures with the agent failed semantic tone", () => {
    renderWithProviders(
      <ChatMessageList
        messages={[assistantFailure()]}
        pendingTask={null}
        availability={undefined}
      />,
    );

    expect(screen.getByText("Agent execution error")).toHaveClass(
      "text-agent-failed/90",
    );
  });
});
