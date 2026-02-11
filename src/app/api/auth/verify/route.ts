import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const token = request.headers.get("X-Admin-Token");
  const envToken = process.env.ADMIN_TOKEN;

  if (!envToken || token !== envToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
