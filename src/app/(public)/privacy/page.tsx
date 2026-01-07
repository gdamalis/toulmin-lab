import { Footer, Header } from "@/components/layout";
import { Container } from "@/components/ui";
import { createFooterCopyright, createFooterSections } from "@/lib/footer-config";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.privacy" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.privacy" });
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
              <h2>{t("sections.introduction.title")}</h2>
              <p>{t("sections.introduction.content")}</p>
            </section>

            <section>
              <h2>{t("sections.dataCollection.title")}</h2>
              <p>{t("sections.dataCollection.content")}</p>
            </section>

            <section>
              <h2>{t("sections.dataUsage.title")}</h2>
              <p>{t("sections.dataUsage.content")}</p>
            </section>

            <section>
              <h2>{t("sections.dataStorage.title")}</h2>
              <p>{t("sections.dataStorage.content")}</p>
            </section>

            <section>
              <h2>{t("sections.cookies.title")}</h2>
              <p>{t("sections.cookies.content")}</p>
            </section>

            <section>
              <h2>{t("sections.thirdParties.title")}</h2>
              <p>{t("sections.thirdParties.content")}</p>
            </section>

            <section>
              <h2>{t("sections.userRights.title")}</h2>
              <p>{t("sections.userRights.content")}</p>
            </section>

            <section>
              <h2>{t("sections.security.title")}</h2>
              <p>{t("sections.security.content")}</p>
            </section>

            <section>
              <h2>{t("sections.children.title")}</h2>
              <p>{t("sections.children.content")}</p>
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
