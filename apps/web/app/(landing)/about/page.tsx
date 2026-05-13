import type { Metadata } from "next";
import { AboutPageClient } from "@/features/landing/components/about-page-client";
import { getLandingLocale, landingMetadata } from "@/features/landing/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLandingLocale();
  const copy = landingMetadata[locale].about;
  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: "/about",
    },
    alternates: {
      canonical: "/about",
    },
  };
}

export default function AboutPage() {
  return <AboutPageClient />;
}
