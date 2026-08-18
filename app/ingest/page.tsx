import { EasterEgg } from "@/components/EasterEgg";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IngestDemo } from "@/components/IngestDemo";
import { runIngest } from "@/lib/ingest/run";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Keel — Job ingest",
  description:
    "Public job-API ingest demo. RemoteOK, Arbeitnow, Remotive. Not LinkedIn.",
};

export default async function IngestPage() {
  const initial = await runIngest();

  return (
    <>
      <Header active="ingest" />
      <main>
        <IngestDemo initial={initial} />
      </main>
      <Footer />
      <EasterEgg />
    </>
  );
}
