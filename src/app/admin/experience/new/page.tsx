import { ExperienceForm } from "../_form";

export default function NewExperiencePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">New role</p>
      <h1
        className="font-display text-3xl md:text-4xl mb-8"
        style={{ lineHeight: 0.95 }}
      >
        Add experience entry
      </h1>
      <ExperienceForm mode="create" />
    </div>
  );
}
