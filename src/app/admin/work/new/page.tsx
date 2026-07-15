import { WorkProjectForm } from "../_form";

export default function NewWorkProjectPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <p className="font-mono text-[color:var(--meta)] mb-2">New</p>
      <h1 className="font-display text-3xl md:text-4xl mb-8" style={{ lineHeight: 0.95 }}>
        New work project
      </h1>
      <WorkProjectForm mode="create" />
    </div>
  );
}
