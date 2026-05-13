import { CaseStudyForm } from "../_form";

export default function NewCaseStudyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">New</p>
      <h1
        className="font-display text-3xl md:text-4xl mb-8"
        style={{ lineHeight: 0.95 }}
      >
        New case study
      </h1>
      <CaseStudyForm mode="create" />
    </div>
  );
}
