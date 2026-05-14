import { Instrument_Serif, Noto_Serif_SC } from "next/font/google";
import { LocaleProvider } from "@/features/landing/i18n";
import { getLandingLocale, landingMetadata } from "@/features/landing/i18n/server";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif-latin",
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif-cjk",
});

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const initialLocale = await getLandingLocale();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Multica",
        url: "https://www.multica.ai",
        sameAs: ["https://github.com/multica-ai/multica"],
      },
      {
        "@type": "SoftwareApplication",
        name: "Multica",
        applicationCategory: "ProjectManagement",
        operatingSystem: "Web",
        description: landingMetadata[initialLocale].jsonLdDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className={`${instrumentSerif.variable} ${notoSerifSC.variable} landing-light h-full overflow-x-hidden overflow-y-auto bg-white`}
      >
        <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
      </div>
    </>
  );
}
