import { Header } from "@/components/layout";
import {
  ChartIcon,
  CheckBadgeIcon,
  CTASection,
  FeatureSection,
  HeroSection,
  LightningIcon,
  ShareIcon,
} from "@/components/ui";
import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.home" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "Toulmin Lab Logo",
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/logo.png"],
    },
  };
}

export default function Home() {
  const t = useTranslations("pages.home");

  const features = [
    {
      title: t("features.clarity.title"),
      description: t("features.clarity.description"),
      icon: <LightningIcon className="h-6 w-6 text-white" />,
    },
    {
      title: t("features.persuasion.title"),
      description: t("features.persuasion.description"),
      icon: <CheckBadgeIcon className="h-6 w-6 text-white" />,
    },
    {
      title: t("features.academic.title"),
      description: t("features.academic.description"),
      icon: <ChartIcon className="h-6 w-6 text-white" />,
    },
    {
      title: t("features.visualize.title"),
      description: t("features.visualize.description"),
      icon: <ShareIcon className="h-6 w-6 text-white" />,
    },
  ];

  return (
    <div className="bg-white">
      <Header />

      <HeroSection
        title={t("hero.title")}
        description={t("hero.description")}
        primaryCta={{
          text: t("getStarted"),
          href: "/auth",
        }}
        secondaryCta={{
          text: t("learnMore"),
          href: "#features",
        }}
      />

      <div id="features">
        <FeatureSection
          heading={t("featureSection.heading")}
          subheading={t("featureSection.subheading")}
          description={t("featureSection.description")}
          features={features}
        />
      </div>

      <CTASection
        title={t("ctaSection.title")}
        description={t("ctaSection.description")}
        buttonText={t("getStarted")}
        buttonHref="/auth"
      />
    </div>
  );
}
