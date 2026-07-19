import { getTranslations } from "next-intl/server";
import { BlurFade } from "@/components/ui/blur-fade";

type LegalSection = { h: string; p: string[] };

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Șablon pentru paginile legale — cuprins sticky în stânga + text în dreapta.
 * Umple ambele coloane și ajută navigarea unui document lung.
 */
export async function LegalPage({ namespace }: { namespace: string }) {
  const t = await getTranslations(namespace);
  const sections = t.raw("sections") as LegalSection[];

  return (
    <main>
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-14">
          <BlurFade>
            <h1 className="max-w-3xl text-3xl md:text-4xl">{t("title")}</h1>
            <p className="mt-3 text-base text-muted-foreground">{t("updated")}</p>
          </BlurFade>
        </div>
      </section>

      <section className="section-pad bg-background">
        <div className="container-site grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-16">
          {/* Cuprins — sticky pe desktop */}
          <nav aria-label="Cuprins" className="hidden lg:block">
            <ul className="sticky top-28 space-y-1 border-l border-border">
              {sections.map((section) => (
                <li key={section.h}>
                  <a
                    href={`#${slug(section.h)}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-base text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
                  >
                    {section.h}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Conținut */}
          <div className="max-w-3xl space-y-10">
            {sections.map((section) => (
              <section key={section.h} id={slug(section.h)} className="scroll-mt-28">
                <h2 className="text-2xl md:text-3xl">{section.h}</h2>
                <div className="mt-4 space-y-4">
                  {section.p.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-base leading-relaxed text-foreground md:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
