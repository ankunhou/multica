import { test, expect } from "@playwright/test";
import {
  loginAsDefault,
  minimizeChatIfOpen,
  workspaceSwitcherButton,
} from "./helpers";

test.describe("Settings", () => {
  test("updating workspace name reflects in sidebar immediately", async ({
    page,
  }) => {
    await loginAsDefault(page);

    // Read the current workspace name from the sidebar
    const sidebarName = workspaceSwitcherButton(page);
    const originalName = "E2E Workspace";

    // Navigate to settings
    await page.getByRole("link", { name: "Settings" }).click();
    await page.waitForURL("**/settings");
    await page.getByRole("tab", { name: "General" }).click();
    await minimizeChatIfOpen(page);

    // Change workspace name
    const generalPanel = page.getByRole("tabpanel", { name: "General" });
    const nameInput = generalPanel.locator('input[type="text"]').first();
    await nameInput.clear();
    const newName = "Renamed WS " + Date.now();
    await nameInput.fill(newName);

    // Save
    await generalPanel.getByRole("button", { name: "Save" }).click();

    // Wait for save confirmation
    await expect(page.getByText("Workspace settings saved")).toBeVisible({
      timeout: 5000,
    });

    // Sidebar should reflect the new name WITHOUT page refresh
    await expect(
      page.getByRole("button", { name: new RegExp(newName) }),
    ).toBeVisible();

    // Restore original name so other tests aren't affected
    await nameInput.clear();
    await nameInput.fill(originalName);
    await generalPanel.getByRole("button", { name: "Save" }).click();
    await expect(
      page.getByRole("button", { name: originalName }),
    ).toBeVisible();
  });
});
