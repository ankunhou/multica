"use client";

import React from "react";
import {
  User,
  SlidersHorizontal,
  Key,
  Settings,
  Users,
  FolderGit2,
  FlaskConical,
  Bell,
  Plug,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@multica/ui/components/ui/tabs";
import { useCurrentWorkspace } from "@multica/core/paths";
import { useNavigation } from "../../navigation";
import { AccountTab } from "./account-tab";
import { PreferencesTab } from "./preferences-tab";
import { TokensTab } from "./tokens-tab";
import { WorkspaceTab } from "./workspace-tab";
import { MembersTab } from "./members-tab";
import { RepositoriesTab } from "./repositories-tab";
import { IntegrationsTab } from "./integrations-tab";
import { LabsTab } from "./labs-tab";
import { NotificationsTab } from "./notifications-tab";
import { useT } from "../../i18n";

const ACCOUNT_TAB_KEYS = ["profile", "preferences", "notifications", "tokens"] as const;
const ACCOUNT_TAB_ICONS = {
  profile: User,
  preferences: SlidersHorizontal,
  notifications: Bell,
  tokens: Key,
} as const;

const WORKSPACE_TAB_KEYS = ["general", "repositories", "integrations", "labs", "members"] as const;
const WORKSPACE_TAB_VALUES = {
  general: "workspace",
  repositories: "repositories",
  integrations: "integrations",
  labs: "labs",
  members: "members",
} as const;
const WORKSPACE_TAB_ICONS = {
  general: Settings,
  repositories: FolderGit2,
  integrations: Plug,
  labs: FlaskConical,
  members: Users,
} as const;

const DEFAULT_TAB = "profile";
const TAB_QUERY_KEY = "tab";

export interface ExtraSettingsTab {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface SettingsPageProps {
  /** Additional tabs injected by platform (e.g. desktop daemon settings) */
  extraAccountTabs?: ExtraSettingsTab[];
}

export function SettingsPage({ extraAccountTabs }: SettingsPageProps = {}) {
  const { t } = useT("settings");
  const workspaceName = useCurrentWorkspace()?.name;
  const navigation = useNavigation();

  // Whitelist of valid tab values; unknown ?tab=… values silently fall back to
  // the default. Whitelisting also blocks junk like ?tab=<script> from
  // surfacing in the DOM via Radix Tabs internals.
  const validTabs = React.useMemo(
    () =>
      new Set<string>([
        ...ACCOUNT_TAB_KEYS,
        ...Object.values(WORKSPACE_TAB_VALUES),
        ...(extraAccountTabs?.map((tab) => tab.value) ?? []),
      ]),
    [extraAccountTabs],
  );

  const tabFromUrl = navigation.searchParams.get(TAB_QUERY_KEY);
  const activeTab =
    tabFromUrl && validTabs.has(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;

  // replace (not push) so settings tab switches don't pollute browser history.
  // Preserve any other query params the page may carry.
  const handleTabChange = (next: string) => {
    const params = new URLSearchParams(navigation.searchParams);
    params.set(TAB_QUERY_KEY, next);
    navigation.replace(`${navigation.pathname}?${params.toString()}`);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      orientation="vertical"
      className="flex-1 min-h-0 gap-0 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-background"
    >
      {/* Left nav (stacks on top on mobile, sidebar on md+) */}
      <div className="shrink-0 border-b bg-sidebar/45 p-3 md:w-64 md:border-b-0 md:border-r md:border-border/70 md:bg-sidebar/35 md:p-4 md:overflow-y-auto">
        <div className="mb-5 px-2 pt-1">
          <h1 className="text-lg font-semibold tracking-tight">{t(($) => $.page.title)}</h1>
        </div>
        <TabsList variant="line" className="flex-col items-stretch w-full gap-1">
          {/* My Account group */}
          <span className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground/80">
            {t(($) => $.page.my_account)}
          </span>
          {ACCOUNT_TAB_KEYS.map((key) => {
            const Icon = ACCOUNT_TAB_ICONS[key];
            return (
              <TabsTrigger key={key} value={key}>
                <Icon className="h-4 w-4" />
                {t(($) => $.page.tabs[key])}
              </TabsTrigger>
            );
          })}
          {extraAccountTabs?.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}

          {/* Workspace group */}
          <span className="px-2 pb-1 pt-5 text-xs font-medium text-muted-foreground/80 truncate">
            {workspaceName ?? t(($) => $.page.workspace_fallback)}
          </span>
          {WORKSPACE_TAB_KEYS.map((key) => {
            const Icon = WORKSPACE_TAB_ICONS[key];
            return (
              <TabsTrigger key={key} value={WORKSPACE_TAB_VALUES[key]}>
                <Icon className="h-4 w-4" />
                {t(($) => $.page.tabs[key])}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Right content */}
      <div className="flex-1 min-w-0 md:overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-5 py-10 md:px-10 md:py-20">
          <TabsContent value="profile"><AccountTab /></TabsContent>
          <TabsContent value="preferences"><PreferencesTab /></TabsContent>
          <TabsContent value="notifications"><NotificationsTab /></TabsContent>
          <TabsContent value="tokens"><TokensTab /></TabsContent>
          <TabsContent value="workspace"><WorkspaceTab /></TabsContent>
          <TabsContent value="repositories"><RepositoriesTab /></TabsContent>
          <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
          <TabsContent value="labs"><LabsTab /></TabsContent>
          <TabsContent value="members"><MembersTab /></TabsContent>
          {extraAccountTabs?.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>{tab.content}</TabsContent>
          ))}
        </div>
      </div>
    </Tabs>
  );
}
