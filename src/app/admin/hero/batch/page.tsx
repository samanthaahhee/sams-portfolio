import Link from "next/link";
import { BatchUploadForm } from "./_form";

export default function BatchHeroUploadPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <Link
          href="/admin/hero"
          className="font-mono text-[color:var(--meta)] hover:text-[color:var(--ink)] text-[11px] uppercase tracking-[0.14em]"
        >
          ← Hero deck
        </Link>
        <h1
          className="font-display text-4xl md:text-5xl mt-3"
          style={{ lineHeight: 0.95 }}
        >
          Batch upload
        </h1>
        <p className="font-mono text-[color:var(--meta)] text-[11px] mt-3 max-w-prose leading-relaxed">
          Drop multiple images at once. Each becomes a hero card with
          the filename as a placeholder title. After upload, you can
          edit titles + add links from the deck list.
        </p>
      </header>

      <BatchUploadForm />
    </div>
  );
}
