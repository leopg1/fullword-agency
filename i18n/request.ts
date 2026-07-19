import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { applyOverrides, getContentOverrides } from "@/lib/content";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const defaults = (await import(`../messages/${locale}.json`)).default;
  // Suprascrie textele schimbate din panoul de admin (tabelul fw_content).
  const overrides = await getContentOverrides(locale);

  return {
    locale,
    messages: applyOverrides(defaults, overrides),
  };
});
