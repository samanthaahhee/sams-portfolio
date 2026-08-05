"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Full-screen loading overlay shown once when the homepage first mounts.
 *  Logo scales up + fades in, holds for 2s, then the whole overlay slides
 *  off the top of the screen and fades out, revealing the page underneath
 *  (which has already been animating in behind it). */
export function LogoLoader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          exit={{ y: "-100vh", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            background: "#fff",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.img
            src="/logo/samahhee.svg"
            alt="Sam Ahhee"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: "min(60vw, 480px)", height: "auto", display: "block" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
