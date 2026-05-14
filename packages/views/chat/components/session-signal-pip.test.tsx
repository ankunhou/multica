// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatSessionSignalPip } from "./session-signal-pip";

describe("ChatSessionSignalPip", () => {
  it("renders running sessions with the warning activity tone", () => {
    render(<ChatSessionSignalPip signal="running" label="Running" />);

    expect(screen.getByLabelText("Running")).toHaveClass("bg-agent-running", "animate-pulse");
  });

  it("renders unread sessions with the brand tone", () => {
    render(<ChatSessionSignalPip signal="unread" label="Unread" />);

    expect(screen.getByLabelText("Unread")).toHaveClass("bg-brand");
  });
});
