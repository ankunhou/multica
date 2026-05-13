import type { Metadata } from "next";
import { fetchLatestRelease } from "@/features/landing/utils/github-release";
import { getLandingLocale, landingMetadata } from "@/features/landing/i18n/server";
import { DownloadClient } from "./download-client";

// Vercel ISR: the server fetch inside fetchLatestRelease carries
// `next: { revalidate: 300 }`, which makes GitHub API cost at most
// one request per region per 5 minutes. Page-level revalidate mirrors
// that window so the first paint also refreshes every 5 minutes.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLandingLocale();
  const copy = landingMetadata[locale].download;
  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: "/download",
    },
    alternates: {
      canonical: "/download",
    },
  };
}

export default async function DownloadPage() {
  const release = await fetchLatestRelease();
  return <DownloadClient release={release} />;
}
