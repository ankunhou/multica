import { describe, expect, it } from "vitest";
import type { Agent } from "@multica/core/types";
import {
  deriveQuickAgentName,
  makeUniqueQuickAgentName,
} from "./quick-create-agent-dialog";

describe("quick create agent helpers", () => {
  it("derives a compact agent name from a Chinese sentence", () => {
    expect(
      deriveQuickAgentName(
        "帮我审查前端 PR，重点关注可访问性和状态管理。",
        "新智能体",
      ),
    ).toBe("审查前端 PR，重点关注可访问性和状态管理");
  });

  it("derives a compact agent name from an English creation prompt", () => {
    expect(
      deriveQuickAgentName(
        "Create a security review agent for API changes.",
        "New Agent",
      ),
    ).toBe("security review agent for API c…");
  });

  it("deduplicates names against existing agents", () => {
    const agents = [
      { name: "Review Agent" },
      { name: "Review Agent 2" },
    ] as Agent[];

    expect(makeUniqueQuickAgentName("Review Agent", agents)).toBe(
      "Review Agent 3",
    );
  });
});
