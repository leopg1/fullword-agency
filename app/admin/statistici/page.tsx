import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHelp } from "@/components/admin/admin-help";
import { requireAdmin } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { isJobPage, pageLabel, sourceLabel } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type View = { path: string; source: string; visitor: string; day: string };

/** Ziua (UTC) cu `n` zile în urmă, ca YYYY-MM-DD. */
function dayAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <p className="text-base font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-base text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Listă cu bară proporțională — se citește dintr-o privire. */
function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) return <p className="text-base text-muted-foreground">Încă nu sunt date.</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-base">{r.label}</span>
            <span className="shrink-0 text-base font-semibold tabular-nums">{r.value}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminStatsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const since = dayAgo(34);
  const { data: rawViews, error } = await supabase
    .from("fw_pageviews")
    .select("path, source, visitor, day")
    .gte("day", since)
    .limit(100000);

  // Tabelul nu există încă → arătăm instrucțiunea, nu o eroare urâtă.
  if (error) {
    return (
      <AdminShell active="/admin/statistici">
        <AdminHelp>
          <p>
            <strong>Statisticile nu sunt încă pornite.</strong>
          </p>
          <p>
            Trebuie rulată o singură dată comanda de pregătire a bazei de date. Dezvoltatorul o
            găsește în proiect, la <code>scripts/sql/fw_pageviews.sql</code>.
          </p>
        </AdminHelp>
        <h1 className="text-2xl">Statistici site</h1>
      </AdminShell>
    );
  }

  const views = (rawViews ?? []) as View[];

  // titluri prietenoase pentru joburi și articole
  const [{ data: jobs }, { data: posts }] = await Promise.all([
    supabase.from("fw_jobs").select("slug, title_ro"),
    supabase.from("fw_posts").select("slug, title_ro"),
  ]);
  const jobTitles = Object.fromEntries((jobs ?? []).map((j) => [j.slug, j.title_ro]));
  const postTitles = Object.fromEntries((posts ?? []).map((p) => [p.slug, p.title_ro]));

  const today = dayAgo(0);
  const yesterday = dayAgo(1);
  const last7 = dayAgo(6);
  const monthStart = new Date().toISOString().slice(0, 8) + "01";

  const inRange = (v: View, from: string, to?: string) => v.day >= from && (!to || v.day <= to);
  const uniq = (list: View[]) => new Set(list.map((v) => v.visitor)).size;

  const todayViews = views.filter((v) => v.day === today);
  const yesterdayViews = views.filter((v) => v.day === yesterday);
  const weekViews = views.filter((v) => inRange(v, last7));
  const monthViews = views.filter((v) => inRange(v, monthStart));

  // grafic pe 30 de zile
  const days = Array.from({ length: 30 }, (_, i) => dayAgo(29 - i));
  const perDay = days.map((d) => {
    const list = views.filter((v) => v.day === d);
    return { day: d, visitors: uniq(list), views: list.length };
  });
  const maxDay = Math.max(...perDay.map((d) => d.visitors), 1);

  // pagini populare (ultimele 30 de zile)
  const pageCounts = new Map<string, number>();
  for (const v of views) pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
  const topPages = [...pageCounts.entries()]
    .map(([path, value]) => ({ label: pageLabel(path, jobTitles, postTitles), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // de unde vin (excludem navigarea internă)
  const srcCounts = new Map<string, number>();
  for (const v of views) {
    if (v.source === "intern") continue;
    srcCounts.set(v.source, (srcCounts.get(v.source) ?? 0) + 1);
  }
  const topSources = [...srcCounts.entries()]
    .map(([s, value]) => ({ label: sourceLabel(s), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  // Conversie: vizite pe anunțuri → aplicări.
  // Comparăm DOAR perioada în care avem și urmărire, altfel ies procente absurde
  // (aplicări vechi împărțite la vizite de azi). Rata apare abia când sunt destule
  // vizite cât să însemne ceva.
  const trackedDays = views.map((v) => v.day).sort();
  const firstTracked = trackedDays[0] ?? since;
  const jobPageVisits = uniq(views.filter((v) => isJobPage(v.path)));
  const { count: appsCount } = await supabase
    .from("fw_applications")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${firstTracked}T00:00:00Z`);
  const apps = appsCount ?? 0;
  const MIN_FOR_RATE = 10;
  const showRate = jobPageVisits >= MIN_FOR_RATE;
  const rate = showRate ? Math.round((Math.min(apps, jobPageVisits) / jobPageVisits) * 1000) / 10 : 0;

  // top joburi după aplicări
  const { data: appRows } = await supabase
    .from("fw_applications")
    .select("job_id, fw_jobs(title_ro)")
    .gte("created_at", `${since}T00:00:00Z`)
    .limit(2000);
  const jobAppCounts = new Map<string, number>();
  for (const r of appRows ?? []) {
    const j = (Array.isArray(r.fw_jobs) ? r.fw_jobs[0] : r.fw_jobs) as { title_ro: string } | null;
    const label = j?.title_ro ?? "Aplicare fără job selectat";
    jobAppCounts.set(label, (jobAppCounts.get(label) ?? 0) + 1);
  }
  const topJobs = [...jobAppCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const fmtDay = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });

  return (
    <AdminShell active="/admin/statistici">
      <AdminHelp>
        <p>Aici vedeți cât de vizitat e site-ul și ce anume caută oamenii pe el.</p>
        <p>
          <strong>Vizitatori</strong> = câți oameni diferiți au intrat. <strong>Vizualizări</strong> =
          câte pagini au deschis în total (un om poate deschide mai multe).
        </p>
        <p>
          Nu folosim cookie-uri și nu reținem date personale — de aceea site-ul nu are nevoie de
          bandă de acceptare a cookie-urilor.
        </p>
      </AdminHelp>

      <h1 className="text-2xl">Statistici site</h1>

      {/* Cifrele mari */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Astăzi" value={uniq(todayViews)} hint={`${todayViews.length} vizualizări`} />
        <Stat label="Ieri" value={uniq(yesterdayViews)} hint={`${yesterdayViews.length} vizualizări`} />
        <Stat label="Ultimele 7 zile" value={uniq(weekViews)} hint={`${weekViews.length} vizualizări`} />
        <Stat label="Luna aceasta" value={uniq(monthViews)} hint={`${monthViews.length} vizualizări`} />
      </div>

      {/* Graficul pe 30 de zile */}
      <div className="mt-4">
        <Panel title="Ultimele 30 de zile" subtitle="Câți oameni diferiți au intrat în fiecare zi">
          {views.length === 0 ? (
            <p className="text-base text-muted-foreground">
              Încă nu sunt vizite înregistrate. Datele apar de la prima vizită pe site.
            </p>
          ) : (
            <>
              <div className="flex h-40 items-end gap-1">
                {perDay.map((d) => (
                  <div key={d.day} className="group relative flex-1" title={`${fmtDay(d.day)}: ${d.visitors} vizitatori`}>
                    <div
                      className={cn(
                        "w-full rounded-t transition-colors",
                        d.day === today ? "bg-brand-dark" : "bg-brand/70 group-hover:bg-brand"
                      )}
                      style={{ height: `${Math.max((d.visitors / maxDay) * 150, d.visitors > 0 ? 3 : 1)}px` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                <span>{fmtDay(perDay[0].day)}</span>
                <span>{fmtDay(perDay[perDay.length - 1].day)}</span>
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Conversie */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <Panel
            title="Din vizite în aplicări"
            subtitle="Cel mai important număr: câți dintre cei care se uită la anunțuri chiar aplică"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Oameni care au deschis un anunț" value={jobPageVisits} />
              <Stat label="Aplicări primite" value={apps} />
              <Stat
                label="Rata de aplicare"
                value={showRate ? `${rate}%` : "—"}
                hint={
                  showRate
                    ? "din cei care văd un anunț"
                    : `apare după ${MIN_FOR_RATE} vizite pe anunțuri`
                }
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Se compară doar perioada în care avem statistici (din {fmtDay(firstTracked)}), ca
              procentul să fie corect.
            </p>
          </Panel>
        </div>
      </div>

      {/* Pagini + surse */}
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Panel title="Cele mai vizitate pagini" subtitle="Ultimele 30 de zile">
          <BarList rows={topPages} />
        </Panel>
        <Panel title="De unde vin oamenii" subtitle="Ce canal aduce vizitatori">
          <BarList rows={topSources} />
        </Panel>
      </div>

      {/* Top joburi */}
      <div className="mt-4">
        <Panel title="Joburi după numărul de aplicări" subtitle="Ultimele 35 de zile">
          <BarList rows={topJobs} />
        </Panel>
      </div>
    </AdminShell>
  );
}
