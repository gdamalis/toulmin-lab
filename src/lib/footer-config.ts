export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

type TranslationFn = (key: string) => string;

interface FooterSectionsOptions {
  includeResources?: boolean;
}

/**
 * Creates footer sections configuration using the provided translation function.
 * Centralizes footer navigation structure to maintain DRY principle.
 */
export function createFooterSections(
  t: TranslationFn,
  options: FooterSectionsOptions = {}
): FooterSection[] {
  const { includeResources = true } = options;

  const sections: FooterSection[] = [
    {
      title: t("product.title"),
      links: [
        { label: t("product.features"), href: "/#features" },
        { label: t("product.useCases"), href: "/#use-cases" },
        { label: t("product.faq"), href: "/#faq" },
      ],
    },
  ];

  if (includeResources) {
    sections.push({
      title: t("resources.title"),
      links: [
        { label: t("resources.documentation"), href: "/docs" },
        { label: t("resources.support"), href: "/support" },
      ],
    });
  }

  sections.push({
    title: t("legal.title"),
    links: [
      { label: t("legal.terms"), href: "/terms" },
      { label: t("legal.privacy"), href: "/privacy" },
    ],
  });

  return sections;
}

/**
 * Creates the copyright text with the current year.
 */
export function createFooterCopyright(
  t: (key: string, values?: { year: number }) => string
): string {
  return t("copyright", { year: new Date().getFullYear() });
}
