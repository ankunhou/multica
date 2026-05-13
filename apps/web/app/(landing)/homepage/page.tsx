import type { Metadata } from "next";
import { MulticaLanding } from "@/features/landing/components/multica-landing";
import { getLandingLocale, landingMetadata } from "@/features/landing/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLandingLocale();
  const copy = landingMetadata[locale].homepage;
  return {
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      url: "/homepage",
    },
    alternates: {
      canonical: "/homepage",
    },
  };
}

export default function HomepagePage() {
  return <MulticaLanding />;
}
