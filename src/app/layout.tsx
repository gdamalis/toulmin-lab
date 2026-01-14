import "@/app/globals.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Analytics } from "@/components/Analytics";
import ClientProviders from "@/components/providers/ClientProviders";
import Script from "next/script";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Toulmin Diagram Builder",
  description: "Build and export Toulmin argument diagrams",
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale ${locale}:`, error);
    // Fallback to English if messages can't be loaded
    messages = (await import("../../messages/en.json")).default;
  }

  return (
    <html lang={locale}>
      <head>
        {/* Google Consent Mode initialization - must load before GTM */}
        <Script
          id="consent-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // Set region-specific consent defaults
              // EEA + UK: denied (GDPR compliance)
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500,
                'region': ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'IS', 'LI', 'NO']
              });
              
              // Rest of world: granted by default (no legal requirement)
              gtag('consent', 'default', {
                'analytics_storage': 'granted',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted'
              });
              
              // Check if user has already made a choice and update accordingly
              try {
                const consentCookie = document.cookie
                  .split('; ')
                  .find(row => row.startsWith('tl_analytics_consent='));
                if (consentCookie) {
                  const consent = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
                  if (consent.analytics === 'granted') {
                    gtag('consent', 'update', {
                      'analytics_storage': 'granted'
                    });
                  } else if (consent.analytics === 'denied') {
                    gtag('consent', 'update', {
                      'analytics_storage': 'denied'
                    });
                  }
                }
              } catch (e) {
                // Consent cookie not found or invalid, keep defaults
              }
            `,
          }}
        />

        {/* Google Tag Manager - only loads if GTM_ID is configured */}
        {GTM_ID && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        )}
      </head>
      <body className={lato.className}>
        {/* Google Tag Manager (noscript) */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
