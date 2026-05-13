import type { Metadata } from "next";
import { ChangelogPageClient } from "@/features/landing/components/changelog-page-client";
import { getLandingLocale, landingMetadata } from "@/features/landing/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLandingLocale();
  const copy = landingMetadata[locale].changelog;
  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: "/changelog",
    },
    alternates: {
      canonical: "/changelog",
    },
  };
}

export default function ChangelogPage() {
  return <ChangelogPageClient />;
}
