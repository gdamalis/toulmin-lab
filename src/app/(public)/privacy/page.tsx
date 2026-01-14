import { Footer, Header } from "@/components/layout";
import { Container } from "@/components/ui";
import { createFooterCopyright, createFooterSections } from "@/lib/footer-config";
import { getPrivacyEmail } from "@/lib/legal-config";
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

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "pages.privacy" });
  const footerT = await getTranslations({ locale, namespace: "footer" });

  const footerSections = createFooterSections(footerT);
  const privacyEmail = getPrivacyEmail();

  // Section keys to render
  const sectionKeys = [
    'introduction',
    'dataCollection',
    'dataUsage',
    'dataStorage',
    'cookies',
    'analytics',
    'thirdParties',
    'dataRetention',
    'internationalTransfers',
    'userRights',
    'security',
    'children',
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

          {/* Summary Card */}
          <div className="mt-8 rounded-lg bg-primary-50 border border-primary-100 p-6">
            <h2 className="text-lg font-semibold text-primary-900 mb-3">
              {t("summary.title")}
            </h2>
            <ul className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary-600">•</span>
                <span>{t("summary.point1")}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary-600">•</span>
                <span>{t("summary.point2")}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary-600">•</span>
                <span>{t("summary.point3")}</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 mt-0.5 text-primary-600">•</span>
                <span>{t("summary.point4")}</span>
              </li>
              {privacyEmail && (
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-primary-600">•</span>
                  <span>
                    {t("summary.contact")}{' '}
                    <a 
                      href={`mailto:${privacyEmail}`}
                      className="font-medium text-primary-600 hover:text-primary-700 underline"
                    >
                      {privacyEmail}
                    </a>
                  </span>
                </li>
              )}
            </ul>
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
                if (key === 'contact' && privacyEmail) {
                  return (
                    <section key={key}>
                      <h2>{title}</h2>
                      {renderContent(content)}
                      <p className="mt-4">
                        <a 
                          href={`mailto:${privacyEmail}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {privacyEmail}
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
