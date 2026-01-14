import { Footer, Header } from "@/components/layout";
import { Container } from "@/components/ui";
import { createFooterCopyright, createFooterSections } from "@/lib/footer-config";
import { getSupportEmail } from "@/lib/legal-config";
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

/**
 * Helper to render content that may contain paragraph breaks
 * Splits on \n\n and renders each as a separate paragraph
 */
function renderContent(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  if (paragraphs.length === 1) {
    return <p>{content}</p>;
  }
  
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index > 0 ? 'mt-4' : ''}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.terms" });
  const footerT = await getTranslations({ locale, namespace: "footer" });

  const footerSections = createFooterSections(footerT);
  const supportEmail = getSupportEmail();

  // Section keys to render
  const sectionKeys = [
    'acceptance',
    'description',
    'accounts',
    'useLicense',
    'userContent',
    'aiDisclaimer',
    'prohibitedUses',
    'acceptableUse',
    'analyticsPrivacy',
    'disclaimer',
    'limitations',
    'changes',
    'contact',
  ];

  return (
    <div className="bg-white">
      <Header />
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t("lastUpdated")}</p>

          {/* Important Notice Card */}
          <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              {t("important.title")}
            </h2>
            <p className="text-sm text-amber-800">
              {t("important.message")}
            </p>
          </div>

          {/* Main Content */}
          <div className="mt-12 prose prose-lg prose-primary max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline">
            {sectionKeys.map((key) => {
              // Check if section exists in translations
              const titleKey = `sections.${key}.title`;
              const contentKey = `sections.${key}.content`;
              
              try {
                const title = t(titleKey);
                const content = t(contentKey);
                
                // Special handling for contact section to include email link
                if (key === 'contact' && supportEmail) {
                  return (
                    <section key={key}>
                      <h2>{title}</h2>
                      {renderContent(content)}
                      <p className="mt-4">
                        <a 
                          href={`mailto:${supportEmail}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {supportEmail}
                        </a>
                      </p>
                    </section>
                  );
                }
                
                return (
                  <section key={key}>
                    <h2>{title}</h2>
                    {renderContent(content)}
                  </section>
                );
              } catch {
                // Section doesn't exist in translations, skip it
                return null;
              }
            })}
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
