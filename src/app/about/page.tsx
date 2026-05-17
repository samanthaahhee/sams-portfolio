import { notFound } from "next/navigation";

/**
 * /about is temporarily hidden. Returning notFound() here makes the
 * route render the 404 page so the section is unreachable, while the
 * previous implementation lives in git history (commit a3dc75c)
 * ready to restore.
 */
export const metadata = { title: "Not found" };

export default function AboutPage() {
  notFound();
}
