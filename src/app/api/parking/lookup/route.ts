import {createHash} from "node:crypto";
import {NextResponse} from "next/server";
import {lookupParking, normalizePhone} from "@/lib/parking-lookup.ts";
import {pickko} from "@/lib/pickko-client.ts";
import {allow} from "@/lib/rate-limit.ts";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60_000;
const IP_LIMIT = 20;
const PHONE_LIMIT = 5;

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const phone = typeof body === "object" && body !== null ? (body as {phone?: unknown}).phone : undefined;
  if (typeof phone !== "string" || phone.length > 30) return NextResponse.json({ok: false, code: "INVALID_PHONE"}, {status: 400});

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const digits = normalizePhone(phone);
  const phoneKey = digits === null ? null : createHash("sha256").update(digits).digest("hex");
  const withinIpLimit = await allow(`ip:${ip}`, IP_LIMIT, WINDOW_MS);
  const withinPhoneLimit = phoneKey === null || (await allow(`phone:${phoneKey}`, PHONE_LIMIT, WINDOW_MS));
  if (!withinIpLimit || !withinPhoneLimit) {
    return NextResponse.json({ok: false, code: "TOO_MANY"}, {status: 429});
  }

  try {
    const result = await lookupParking(pickko, phone);
    return NextResponse.json(result, {headers: {"cache-control": "no-store"}});
  } catch (error) {
    console.error("[parking] 조회 실패:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ok: false, code: "UPSTREAM"}, {status: 502});
  }
}
