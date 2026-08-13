/* The top meta row — identical copy and styling everywhere it appears, so
   the homepage and a project page read as the same site. Only the colour
   changes: project pages tint it with their accent. */

export const META = {
  role: "VISUAL COMMS DESIGNER",
  year: "2026",
  /* Lowercase deliberately, unlike its neighbours: an address set in caps
     reads as shouting and is harder to transcribe. */
  handle: "samantha.ahhee@gmail.com",
};

/* Three equal-weighted tracks rather than space-between: the outer labels
   are different lengths, so distributing by text width pushed the year
   ~23px right of true centre and it no longer lined up with the project
   title beneath it. Equal 1fr side tracks put the middle item on the
   row's actual midpoint whatever the labels say. */
export const META_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: "4px 20px",
  fontSize: "clamp(10px, 2.6vw, 13px)",
  fontWeight: 600,
  letterSpacing: "0.08em",
};

/** `onReplayIntro` turns the role label into the control that replays the
 *  loading sequence. Without it the label is plain text, which is what
 *  every page other than the homepage wants. */
export function MetaRowContent({ onReplayIntro }: { onReplayIntro?: () => void } = {}) {
  return (
    <>
      {onReplayIntro ? (
        <button
          type="button"
          onClick={onReplayIntro}
          className="hover:opacity-70 transition-opacity"
          style={{ font: "inherit", letterSpacing: "inherit", color: "inherit", textAlign: "left", cursor: "pointer" }}
        >
          {META.role}
        </button>
      ) : (
        <span>{META.role}</span>
      )}
      <span style={{ textAlign: "center" }}>{META.year}</span>
      <span style={{ textAlign: "right" }}>{META.handle}</span>
    </>
  );
}
