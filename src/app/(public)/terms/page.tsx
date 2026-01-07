import { Footer, Header } from "@/components/layout";
import { Container } from "@/components/ui";
import { createFooterCopyright, createFooterSections } from "@/lib/footer-config";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.terms" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.terms" });
  const footerT = await getTranslations({ locale, namespace: "footer" });

  const footerSections = createFooterSections(footerT);

  return (
    <div className="bg-white">
      <Header />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t("lastUpdated")}</p>

          <div className="mt-12 prose prose-lg prose-primary max-w-none">
            <section>
              <h2>{t("sections.acceptance.title")}</h2>
              <p>{t("sections.acceptance.content")}</p>
            </section>

            <section>
              <h2>{t("sections.description.title")}</h2>
              <p>{t("sections.description.content")}</p>
            </section>

            <section>
              <h2>{t("sections.accounts.title")}</h2>
              <p>{t("sections.accounts.content")}</p>
            </section>

            <section>
              <h2>{t("sections.useLicense.title")}</h2>
              <p>{t("sections.useLicense.content")}</p>
            </section>

            <section>
              <h2>{t("sections.userContent.title")}</h2>
              <p>{t("sections.userContent.content")}</p>
            </section>

            <section>
              <h2>{t("sections.prohibitedUses.title")}</h2>
              <p>{t("sections.prohibitedUses.content")}</p>
            </section>

            <section>
              <h2>{t("sections.disclaimer.title")}</h2>
              <p>{t("sections.disclaimer.content")}</p>
            </section>

            <section>
              <h2>{t("sections.limitations.title")}</h2>
              <p>{t("sections.limitations.content")}</p>
            </section>

            <section>
              <h2>{t("sections.changes.title")}</h2>
              <p>{t("sections.changes.content")}</p>
            </section>

            <section>
              <h2>{t("sections.contact.title")}</h2>
              <p>{t("sections.contact.content")}</p>
            </section>
          </div>
        </div>
      </Container>
      <Footer
        sections={footerSections}
        copyright={createFooterCopyright(footerT)}
        tagline={footerT("tagline")}
      />
    </div>
  );
}
