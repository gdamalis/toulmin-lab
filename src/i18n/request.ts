import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale } from "@/i18n/settings";

async function getLocaleFromHeaders(): Promise<string> {
  // We'll implement a simple language detection based on the Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";

  // Check if the Accept-Language header contains 'es' for Spanish
  if (acceptLanguage.includes("es")) {
    return "es";
  }

  return defaultLocale;
}

async function getLocaleFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value;
}

export default getRequestConfig(async () => {
  // First try to get locale from cookie, then from browser, or fallback to default
  const locale =
    (await getLocaleFromCookie()) ??
    (await getLocaleFromHeaders()) ??
    defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
