import { NextResponse } from "next/server";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var is not set on the server." },
      { status: 500 },
    );
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get("from") || "/admin";
  const res = NextResponse.redirect(new URL(from, req.url), 303);
  res.cookies.set("admin-session", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });
  return res;
}
