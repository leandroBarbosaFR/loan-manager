import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { createTranslator, getDictionary, type Translator } from "./dictionaries";

/** Reads the active locale from the cookie (server side). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Translation function for Server Components / Server Actions. */
export async function getT(): Promise<Translator> {
  const locale = await getLocale();
  return createTranslator(getDictionary(locale));
}
