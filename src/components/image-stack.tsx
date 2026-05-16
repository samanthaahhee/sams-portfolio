"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/**
 * Stacked photos with auto-cycle. The top card swaps every ~3 seconds:
 * the front image slides to the back, the next image rotates into view.
 * Small offset + rotation per card so the stack reads as a deck.
 */
export function ImageStack({
  images,
  caption,
  interval = 3200,
}: {
  images: string[];
  caption?: string;
  interval?: number;
}) {
  const valid = images.filter(Boolean);
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (valid.length < 2) return;
    const id = window.setInterval(
      () => setTop((p) => (p + 1) % valid.length),
      interval,
    );
    return () => window.clearInterval(id);
  }, [valid.length, interval]);

  if (valid.length === 0) return null;

  return (
    <figure className="space-y-2">
      <div
        className="relative mx-auto"
        style={{
          aspectRatio: "16 / 10",
          maxWidth: "min(100%, 720px)",
        }}
      >
        {valid.map((src, idx) => {
          const offset = (idx - top + valid.length) % valid.length;
          return (
            <motion.div
              key={src + idx}
              className="absolute inset-0 rounded-sm overflow-hidden shadow-[0_8px_24px_rgba(20,15,10,0.18)]"
              animate={{
                zIndex: valid.length - offset,
                scale: 1 - offset * 0.03,
                rotate: offset === 0 ? 0 : -3 + offset * 4,
                x: offset === 0 ? 0 : -10 + offset * 16,
                y: offset === 0 ? 0 : 6 + offset * 6,
                opacity: offset > 2 ? 0 : 1 - offset * 0.05,
              }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ background: "transparent" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          );
        })}
      </div>
      {caption && (
        <figcaption className="font-mono text-[color:var(--meta)] text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
