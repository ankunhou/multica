import { test, expect } from "@playwright/test";
import { createTestApi, loginAsDefault } from "./helpers";
import type { TestApiClient } from "./fixtures";

test.describe("Comments", () => {
  let api: TestApiClient;
  let issueId: string;
  let workspaceSlug: string;

  test.beforeEach(async ({ page }) => {
    api = await createTestApi();
    const issue = await api.createIssue("E2E Comment Test " + Date.now());
    issueId = issue.id;
    workspaceSlug = await loginAsDefault(page);
  });

  test.afterEach(async () => {
    await api.cleanup();
  });

  test("can add a comment on an issue", async ({ page }) => {
    await page.goto(`/${workspaceSlug}/issues/${issueId}`);
    await page.waitForURL(new RegExp(`/${workspaceSlug}/issues/${issueId}$`));

    // Wait for issue detail to load
    await expect(page.locator("text=Properties")).toBeVisible();

    // Type a comment
    const commentText = "E2E comment " + Date.now();
    const commentInput = page.locator(
      '.rich-text-editor:has([data-placeholder="Leave a comment..."])',
    );
    await expect(commentInput).toBeVisible();
    await commentInput.click();
    await page.keyboard.type(commentText);

    // Submit the comment
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled({
      timeout: 10000,
    });
    await page.keyboard.press("ControlOrMeta+Enter");

    // Comment should appear in the activity section
    await expect(page.locator(`text=${commentText}`)).toBeVisible({
      timeout: 5000,
    });
  });

  test("comment submit button is disabled when empty", async ({ page }) => {
    await page.goto(`/${workspaceSlug}/issues/${issueId}`);
    await page.waitForURL(new RegExp(`/${workspaceSlug}/issues/${issueId}$`));

    await expect(page.locator("text=Properties")).toBeVisible();

    // Submit button should be disabled when input is empty
    const submitBtn = page.getByRole("button", { name: "Send" });
    await expect(submitBtn).toBeDisabled();
  });
});
