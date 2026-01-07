import { Footer, Header } from "@/components/layout";
import {
  AnimatedSection,
  ChartIcon,
  CheckBadgeIcon,
  CTASection,
  FAQSection,
  FeatureSection,
  HeroSection,
  HowItWorksSection,
  LightningIcon,
  ShareIcon,
  // TestimonialsSection,
  UseCaseIcons,
  UseCasesSection,
} from "@/components/ui";
import type { Step } from "@/components/ui/HowItWorksSection";
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
  const footerT = useTranslations("footer");

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

  const howItWorksSteps: Step[] = [
    {
      number: 1,
      title: t("howItWorks.steps.signIn.title"),
      description: t("howItWorks.steps.signIn.description"),
      icon: "signIn",
    },
    {
      number: 2,
      title: t("howItWorks.steps.build.title"),
      description: t("howItWorks.steps.build.description"),
      icon: "build",
    },
    {
      number: 3,
      title: t("howItWorks.steps.share.title"),
      description: t("howItWorks.steps.share.description"),
      icon: "share",
    },
  ];

  const useCases = [
    {
      id: "universities",
      icon: UseCaseIcons.universities,
      title: t("useCases.universities.title"),
      headline: t("useCases.universities.headline"),
      description: t("useCases.universities.description"),
      features: [
        t("useCases.universities.features.0"),
        t("useCases.universities.features.1"),
        t("useCases.universities.features.2"),
      ],
      imageSrc: "/images/usecase-university.jpg",
      imageAlt: t("useCases.universities.imageAlt"),
    },
    {
      id: "bible-institutes",
      icon: UseCaseIcons.bibleInstitutes,
      title: t("useCases.bibleInstitutes.title"),
      headline: t("useCases.bibleInstitutes.headline"),
      description: t("useCases.bibleInstitutes.description"),
      features: [
        t("useCases.bibleInstitutes.features.0"),
        t("useCases.bibleInstitutes.features.1"),
        t("useCases.bibleInstitutes.features.2"),
      ],
      imageSrc: "/images/usecase-bible.jpg",
      imageAlt: t("useCases.bibleInstitutes.imageAlt"),
    },
    {
      id: "researchers",
      icon: UseCaseIcons.researchers,
      title: t("useCases.researchers.title"),
      headline: t("useCases.researchers.headline"),
      description: t("useCases.researchers.description"),
      features: [
        t("useCases.researchers.features.0"),
        t("useCases.researchers.features.1"),
        t("useCases.researchers.features.2"),
      ],
      imageSrc: "/images/usecase-research.jpg",
      imageAlt: t("useCases.researchers.imageAlt"),
    },
  ];

  // const testimonials = [
  //   {
  //     quote: t("testimonials.items.0.quote"),
  //     author: t("testimonials.items.0.author"),
  //     role: t("testimonials.items.0.role"),
  //     institution: t("testimonials.items.0.institution"),
  //   },
  //   {
  //     quote: t("testimonials.items.1.quote"),
  //     author: t("testimonials.items.1.author"),
  //     role: t("testimonials.items.1.role"),
  //     institution: t("testimonials.items.1.institution"),
  //   },
  //   {
  //     quote: t("testimonials.items.2.quote"),
  //     author: t("testimonials.items.2.author"),
  //     role: t("testimonials.items.2.role"),
  //     institution: t("testimonials.items.2.institution"),
  //   },
  // ];

  const faqs = [
    {
      question: t("faq.items.0.question"),
      answer: t("faq.items.0.answer"),
    },
    {
      question: t("faq.items.1.question"),
      answer: t("faq.items.1.answer"),
    },
    {
      question: t("faq.items.2.question"),
      answer: t("faq.items.2.answer"),
    },
    {
      question: t("faq.items.3.question"),
      answer: t("faq.items.3.answer"),
    },
    {
      question: t("faq.items.4.question"),
      answer: t("faq.items.4.answer"),
    },
  ];

  const footerSections = [
    {
      title: footerT("product.title"),
      links: [
        { label: footerT("product.features"), href: "/#features" },
        { label: footerT("product.useCases"), href: "/#use-cases" },
        { label: footerT("product.faq"), href: "/#faq" },
      ],
    },
    // {
    //   title: footerT("resources.title"),
    //   links: [
    //     { label: footerT("resources.documentation"), href: "/docs" },
    //     { label: footerT("resources.support"), href: "/support" },
    //   ],
    // },
    {
      title: footerT("legal.title"),
      links: [
        { label: footerT("legal.terms"), href: "/terms" },
        { label: footerT("legal.privacy"), href: "/privacy" },
      ],
    },
  ];

  return (
    <div className="bg-white">
      <Header />

      <HeroSection
        title={t("hero.title")}
        description={t("hero.description")}
        badgeText={t("hero.badge.text")}
        badgeLabel={t("hero.badge.label")}
        ctaText={t("hero.cta")}
        ctaHref="/auth"
      />

      <HowItWorksSection
        heading={t("howItWorks.heading")}
        subheading={t("howItWorks.subheading")}
        steps={howItWorksSteps}
      />

      <div id="features">
        <AnimatedSection>
          <FeatureSection
            heading={t("featureSection.heading")}
            subheading={t("featureSection.subheading")}
            description={t("featureSection.description")}
            features={features}
          />
        </AnimatedSection>
      </div>

      <div id="use-cases">
        <UseCasesSection
          heading={t("useCases.heading")}
          subheading={t("useCases.subheading")}
          useCases={useCases}
        />
      </div>
      {/* 
Disabling for now until we collect testimonials
      <TestimonialsSection
        heading={t("testimonials.heading")}
        subheading={t("testimonials.subheading")}
        testimonials={testimonials}
      /> */}

      <div id="faq">
        <FAQSection
          heading={t("faq.heading")}
          subheading={t("faq.subheading")}
          faqs={faqs}
        />
      </div>

      <CTASection
        title={t("ctaSection.title")}
        description={t("ctaSection.description")}
        buttonText={t("getStarted")}
        buttonHref="/auth"
      />

      <Footer
        sections={footerSections}
        copyright={footerT("copyright", { year: new Date().getFullYear() })}
        tagline={footerT("tagline")}
      />
    </div>
  );
}
