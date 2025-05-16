import "@/app/globals.css";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Analytics } from "@/components/Analytics";
import ClientProviders from "@/components/providers/ClientProviders";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Toulmin Diagram Builder",
  description: "Build and export Toulmin argument diagrams",
};

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
      <body className={lato.className}>
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
