import {
  HeroSection,
  FeatureSection,
  CTASection,
  LightningIcon,
  CheckBadgeIcon,
  ChartIcon,
  ShareIcon,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

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
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-6">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
      </div>

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
