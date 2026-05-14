import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE } from "@multica/core/i18n";
import type { Locale } from "./types";

export async function getLandingLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  if (stored === "en") return "en";
  if (stored === "zh" || stored === "zh-Hans") return "zh";

  const headersList = await headers();
  const acceptLang = (headersList.get("accept-language") ?? "").toLowerCase();
  if (acceptLang.includes("zh")) return "zh";

  return "en";
}

export const landingMetadata = {
  en: {
    home: {
      title: "Multica - Project Management for Human + Agent Teams",
      description:
        "Open-source platform that turns coding agents into real teammates. Assign tasks, track progress, compound skills.",
      ogDescription: "Manage your human + agent workforce in one place.",
    },
    homepage: {
      title: "Homepage",
      description:
        "Multica - open-source platform that turns coding agents into real teammates. Assign tasks, track progress, compound skills.",
      ogTitle: "Multica - Project Management for Human + Agent Teams",
      ogDescription: "Manage your human + agent workforce in one place.",
    },
    about: {
      title: "About",
      description:
        "Learn about Multica - multiplexed information and computing agent. An open-source project management platform for human + agent teams.",
      ogTitle: "About Multica",
      ogDescription:
        "The story behind Multica and why we're building project management for human + agent teams.",
    },
    changelog: {
      title: "Changelog",
      description: "See what's new in Multica - latest features, improvements, and fixes.",
      ogTitle: "Changelog | Multica",
      ogDescription: "Latest updates and releases from Multica.",
    },
    download: {
      title: "Download Multica",
      description:
        "Download Multica for macOS, Windows, or Linux - or install the CLI for servers and remote dev boxes.",
      ogTitle: "Download Multica",
      ogDescription:
        "Get the Multica desktop app with a bundled daemon, or install the CLI for servers and remote dev boxes.",
    },
    jsonLdDescription:
      "Open-source project management platform that turns coding agents into real teammates.",
  },
  zh: {
    home: {
      title: "Multica - 面向人类与智能体团队的项目管理",
      description: "开源平台，把编码智能体变成真正的队友。分配任务、跟踪进度、积累 skill。",
      ogDescription: "在一个地方管理你的人类 + 智能体团队。",
    },
    homepage: {
      title: "首页",
      description:
        "Multica 是一个开源平台，把编码智能体变成真正的队友。分配任务、跟踪进度、积累 skill。",
      ogTitle: "Multica - 面向人类与智能体团队的项目管理",
      ogDescription: "在一个地方管理你的人类 + 智能体团队。",
    },
    about: {
      title: "关于",
      description:
        "了解 Multica：multiplexed information and computing agent，一个面向人类 + 智能体团队的开源项目管理平台。",
      ogTitle: "关于 Multica",
      ogDescription: "Multica 的由来，以及我们为什么要为人类 + 智能体团队构建项目管理。",
    },
    changelog: {
      title: "更新日志",
      description: "查看 Multica 的最新功能、改进与修复。",
      ogTitle: "更新日志 | Multica",
      ogDescription: "Multica 的最新更新与发布记录。",
    },
    download: {
      title: "下载 Multica",
      description: "下载 macOS、Windows 或 Linux 版 Multica，或者为服务器和远程开发环境安装 CLI。",
      ogTitle: "下载 Multica",
      ogDescription: "获取内置守护进程的 Multica 桌面应用，或者为服务器和远程开发环境安装 CLI。",
    },
    jsonLdDescription: "开源项目管理平台，把编码智能体变成真正的队友。",
  },
} as const satisfies Record<Locale, Record<string, unknown>>;
