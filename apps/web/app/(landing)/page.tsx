import type { Metadata } from "next";
import { MulticaLanding } from "@/features/landing/components/multica-landing";
import { RedirectIfAuthenticated } from "@/features/landing/components/redirect-if-authenticated";
import { getLandingLocale, landingMetadata } from "@/features/landing/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLandingLocale();
  const copy = landingMetadata[locale].home;
  return {
    title: { absolute: copy.title },
    description: copy.description,
    openGraph: {
      title: copy.title,
      description: copy.ogDescription,
      url: "/",
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default function LandingPage() {
  return (
    <>
      <RedirectIfAuthenticated />
      <MulticaLanding />
    </>
  );
}
