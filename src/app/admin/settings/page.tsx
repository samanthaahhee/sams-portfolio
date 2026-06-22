import { getSiteSetting, DEFAULT_CV_URL } from "@/lib/db";
import { SettingsForm } from "./_form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const cvUrl = await getSiteSetting("cv_url", "");
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <p className="font-mono text-[color:var(--meta)] mb-2">Settings</p>
        <h1
          className="font-display text-4xl md:text-5xl"
          style={{ lineHeight: 0.95 }}
        >
          Site settings
        </h1>
      </header>

      <SettingsForm initialCvUrl={cvUrl} defaultCvUrl={DEFAULT_CV_URL} />
    </div>
  );
}
