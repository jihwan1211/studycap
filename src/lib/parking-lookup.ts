import {kstDateString, kstToEpochSec, REQUEST_WINDOW_MINUTES, toRegisterMinutes} from "./parking-time.ts";

export type MemberSummary = {mbNo: number; mbPhone: string};
export type UsageSegment = {tmStart: string; tmEnd: string | null; tmTime: number};
export type MemberView = {now: number; times: UsageSegment[]};

export interface PickkoApi {
  searchMembers(phoneDigits: string): Promise<MemberSummary[]>;
  getMemberView(mbNo: number): Promise<MemberView>;
}

export type LookupFailureCode = "INVALID_PHONE" | "NOT_FOUND" | "MULTIPLE" | "NO_USAGE_TODAY" | "IN_USE" | "TOO_LATE";

export type LookupResult =
  | {ok: true; usedSeconds: number; registerMinutes: number; startTime: string; endTime: string}
  | {ok: false; code: LookupFailureCode};

const MAX_EXACT_MATCHES = 5;
const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return PHONE_PATTERN.test(digits) ? digits : null;
}

function latestTodaySegment(view: MemberView): UsageSegment | null {
  const today = kstDateString(view.now);
  let latest: UsageSegment | null = null;
  for (const segment of view.times) {
    if (!segment.tmStart.startsWith(today)) continue;
    if (latest === null || segment.tmStart > latest.tmStart) latest = segment;
  }
  return latest;
}

export async function lookupParking(api: PickkoApi, rawPhone: string): Promise<LookupResult> {
  const phone = normalizePhone(rawPhone);
  if (phone === null) return {ok: false, code: "INVALID_PHONE"};

  const candidates = (await api.searchMembers(phone)).filter(member => member.mbPhone.replace(/\D/g, "") === phone);
  if (candidates.length === 0) return {ok: false, code: "NOT_FOUND"};
  if (candidates.length > MAX_EXACT_MATCHES) return {ok: false, code: "MULTIPLE"};

  const views = await Promise.all(candidates.map(member => api.getMemberView(member.mbNo)));
  const withUsage = views.flatMap(view => {
    const segment = latestTodaySegment(view);
    return segment === null ? [] : [{segment, now: view.now}];
  });
  if (withUsage.length === 0) return {ok: false, code: "NO_USAGE_TODAY"};
  if (withUsage.length > 1) return {ok: false, code: "MULTIPLE"};

  const {segment, now} = withUsage[0];
  if (!segment.tmEnd) return {ok: false, code: "IN_USE"};
  if (now - kstToEpochSec(segment.tmEnd) > REQUEST_WINDOW_MINUTES * 60) return {ok: false, code: "TOO_LATE"};
  return {
    ok: true,
    usedSeconds: segment.tmTime,
    registerMinutes: toRegisterMinutes(segment.tmTime),
    startTime: segment.tmStart.slice(11, 16),
    endTime: segment.tmEnd.slice(11, 16),
  };
}
