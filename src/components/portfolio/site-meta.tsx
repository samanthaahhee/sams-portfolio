/* The top meta row — identical copy and styling everywhere it appears, so
   the homepage and a project page read as the same site. Only the colour
   changes: project pages tint it with their accent. */

export const META = {
  role: "VISUAL COMMS DESIGNER",
  year: "2026",
  handle: "@SAMANTHAAHHEE",
};

export const META_STYLE: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "4px 20px",
  fontSize: "clamp(10px, 2.6vw, 13px)",
  fontWeight: 600,
  letterSpacing: "0.08em",
};

export function MetaRowContent() {
  return (
    <>
      <span>{META.role}</span>
      <span>{META.year}</span>
      <span>{META.handle}</span>
    </>
  );
}
