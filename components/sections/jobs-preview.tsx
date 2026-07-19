import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { JobCard } from "@/components/site/job-card";
import { getOpenJobs } from "@/lib/jobs";

/** Ultimele 4 joburi deschise — dovadă de activitate + intrare în funnel-ul de candidați. */
export async function JobsPreview() {
  const t = await getTranslations("jobsPreview");
  const jobs = (await getOpenJobs()).slice(0, 4);

  return (
    <section className="section-pad bg-background">
      <div className="container-site">
        <BlurFade inView>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
              <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl border-2 px-6 text-base font-semibold"
            >
              <Link href="/joburi">
                {t("viewAll")}
                <ArrowRight className="size-4.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </BlurFade>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {jobs.map((job, i) => (
            <JobCard key={job.slug} job={job} delay={0.07 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}
