import type {MemberSummary, MemberView, PickkoApi} from "./parking-lookup.ts";

const BASE_URL = process.env.PICKKO_BASE_URL ?? "https://www.pickkoadmin.com";
const LOGIN_TIMEOUT_MS = 20_000;
const API_TIMEOUT_MS = 15_000;
const LOGIN_RETRY_COOLDOWN_MS = 60_000;
const USER_AGENT = "studycap-parking/1.0";

export class PickkoError extends Error {}

function routeLabel(path: string): string {
  return path.split("?")[0].replace(/\/\d+$/, "/:id");
}

let cookie: string | null = null;
let loginInFlight: Promise<void> | null = null;
let lastLoginFailureAt = 0;
let credentialsRejected = false;

async function login(): Promise<void> {
  const id = process.env.PICKKO_ID;
  const password = process.env.PICKKO_PW;
  if (!id || !password) throw new PickkoError("PICKKO_ID / PICKKO_PW 환경변수가 없습니다");
  if (credentialsRejected) throw new PickkoError("계정 정보가 거부되어 재시도하지 않습니다. .env.local을 고치고 서버를 재시작하세요");
  if (Date.now() - lastLoginFailureAt < LOGIN_RETRY_COOLDOWN_MS) throw new PickkoError("직전 로그인 실패 후 대기 중입니다");

  const body = new FormData();
  body.set("mn_id", id);
  body.set("mn_pw", password);
  const startedAt = Date.now();
  const response = await fetch(`${BASE_URL}/manager/login/proc/login.html`, {
    method: "POST",
    body,
    redirect: "manual",
    headers: {origin: BASE_URL, referer: `${BASE_URL}/manager/login.html`, "user-agent": USER_AGENT},
    signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
  }).catch((error: unknown) => {
    throw new PickkoError(`로그인 요청 실패 (${Date.now() - startedAt}ms): ${error instanceof Error ? error.message : "unknown"}`);
  });
  console.info(`[pickko] 로그인 응답 ${Date.now() - startedAt}ms status ${response.status}`);
  const result = (await response.json().catch(() => null)) as {result?: unknown; msg?: unknown} | null;
  const succeeded = response.ok && Boolean(result?.result);
  const pairs = response.headers.getSetCookie().map(line => line.split(";")[0]).filter(Boolean);
  if (!succeeded || pairs.length === 0) {
    lastLoginFailureAt = Date.now();
    if (response.ok && result !== null && !result.result) credentialsRejected = true;
    const reason = result === null ? "JSON 아님" : `result=${JSON.stringify(result.result)} msg=${String(result.msg ?? "").slice(0, 80)}`;
    throw new PickkoError(`로그인 실패 (status ${response.status}, ${reason}, 쿠키 ${pairs.length}개)`);
  }
  cookie = pairs.join("; ");
}

function ensureLogin(): Promise<void> {
  loginInFlight ??= login().finally(() => { loginInFlight = null; });
  return loginInFlight;
}

async function getJson(path: string, allowRelogin = true): Promise<unknown> {
  if (cookie === null) await ensureLogin();
  const startedAt = Date.now();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {cookie: cookie ?? "", accept: "application/json", "user-agent": USER_AGENT},
    redirect: "manual",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  }).catch((error: unknown) => {
    throw new PickkoError(`조회 요청 실패 ${routeLabel(path)} (${Date.now() - startedAt}ms): ${error instanceof Error ? error.message : "unknown"}`);
  });
  console.info(`[pickko] ${routeLabel(path)} ${Date.now() - startedAt}ms status ${response.status}`);
  const isJson = response.headers.get("content-type")?.includes("application/json") === true;
  if (response.ok && isJson) return response.json();
  if (allowRelogin) {
    cookie = null;
    return getJson(path, false);
  }
  throw new PickkoError(`요청 실패 ${routeLabel(path)} (status ${response.status})`);
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null) throw new PickkoError(`응답 형식이 다릅니다: ${label}`);
  return value as Record<string, unknown>;
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new PickkoError(`응답 형식이 다릅니다: ${label}`);
  return value;
}

export const pickko: PickkoApi = {
  async searchMembers(phoneDigits: string): Promise<MemberSummary[]> {
    const data = asRecord(await getJson(`/api/v2/ops/frame?only=members&sort=mb_step&dir=asc&search=${encodeURIComponent(phoneDigits)}`), "frame");
    const list = asArray(asRecord(data.members, "frame.members").list, "frame.members.list");
    return list.map(item => {
      const row = asRecord(item, "member");
      if (typeof row.mbNo !== "number" || typeof row.mbPhone !== "string") throw new PickkoError("응답 형식이 다릅니다: member 필드");
      return {mbNo: row.mbNo, mbPhone: row.mbPhone};
    });
  },

  async getMemberView(mbNo: number): Promise<MemberView> {
    const data = asRecord(await getJson(`/api/v2/ops/member-view/${mbNo}`), "member-view");
    if (typeof data.now !== "number") throw new PickkoError("응답 형식이 다릅니다: now");
    const times = asArray(data.times, "member-view.times").map(item => {
      const row = asRecord(item, "times");
      if (typeof row.tmStart !== "string" || typeof row.tmTime !== "number") throw new PickkoError("응답 형식이 다릅니다: times 필드");
      return {tmStart: row.tmStart, tmEnd: typeof row.tmEnd === "string" && row.tmEnd !== "" ? row.tmEnd : null, tmTime: row.tmTime};
    });
    return {now: data.now, times};
  },
};
