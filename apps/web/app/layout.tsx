import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist_Mono, Inter, Source_Serif_4 } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@multica/ui/components/ui/sonner";
import { cn } from "@multica/ui/lib/utils";
import { WebProviders } from "@/components/web-providers";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@multica/core/i18n";
import { RESOURCES } from "@multica/views/locales";
import "./globals.css";

// Font tokens are assembled in globals.css with Chinese families first.
// next/font only contributes Latin webfont variables here; desktop mirrors
// the same final --font-* stacks in apps/desktop/src/renderer/src/globals.css.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  fallback: ["system-ui", "sans-serif"],
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-latin",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});
// Editorial serif used for onboarding headlines. Italic support for h1 em
// accents (e.g. "...on one shared board."). Only loaded on routes that
// render the font; layout-shift-prevention handled by next/font's synthetic
// fallback metrics, same as Inter.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif-latin",
  fallback: [
    "ui-serif",
    "Iowan Old Style",
    "Apple Garamond",
    "Baskerville",
    "Times New Roman",
    "serif",
  ],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#05070b" },
  ],
};

function isSupportedLocale(value: string | null): value is SupportedLocale {
  return value !== null && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function localeFromHeader(value: string | null): SupportedLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const locale = localeFromHeader(h.get("x-multica-locale"));
  const isZh = locale === "zh-Hans";

  return {
    metadataBase: new URL("https://www.multica.ai"),
    title: {
      default: isZh
        ? "Multica - 面向人类与智能体团队的项目管理"
        : "Multica - Project Management for Human + Agent Teams",
      template: "%s | Multica",
    },
    description: isZh
      ? "开源平台，把编码智能体变成真正的队友。分配任务、跟踪进度、积累 skill。"
      : "Open-source platform that turns coding agents into real teammates. Assign tasks, track progress, compound skills.",
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      shortcut: ["/favicon.svg"],
    },
    openGraph: {
      type: "website",
      siteName: "Multica",
      locale: isZh ? "zh_CN" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@multica_hq",
      creator: "@multica_hq",
    },
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// HTML lang attribute uses BCP-47 region tags that screen readers and font
// stacks recognize widely. i18next keeps `zh-Hans` as its internal locale
// (script subtag is what we actually translate against), but the html element
// expects a region-flavoured tag for accessibility tooling and CJK font selection.
const HTML_LANG: Record<SupportedLocale, string> = {
  en: "en",
  "zh-Hans": "zh-CN",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const locale = localeFromHeader(h.get("x-multica-locale"));
  const resources = { [locale]: RESOURCES[locale] };

  return (
    <html
      lang={HTML_LANG[locale]}
      suppressHydrationWarning
      className={cn("antialiased font-sans h-full", inter.variable, geistMono.variable, sourceSerif.variable)}
    >
      <body className="h-full overflow-hidden" suppressHydrationWarning>
        <ThemeProvider>
          <WebProviders locale={locale} resources={resources}>
            {children}
          </WebProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
