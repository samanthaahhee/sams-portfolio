/* The admin holds two generations of content side by side and they looked
   identical from the inside. Everything under /admin/work drives the NEW
   project pages, so it gets a red band you cannot miss; the legacy
   Projects / Case studies sections are left plain. */

const RED = "#FF2E31";

export default function AdminWorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-8">
      <div
        className="-mx-6 -mt-10 px-6 py-3 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: RED, color: "#fff" }}
      >
        <p className="font-mono uppercase tracking-[0.14em] text-[10px]">
          New site · /work project pages
        </p>
        <p className="font-mono text-[10px] opacity-80">
          Accent colour · overview · page blocks
        </p>
      </div>
      {children}
    </div>
  );
}
