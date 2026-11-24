import assert from "node:assert/strict";
import {formatDuration, kstDateString, kstToEpochSec, toRegisterMinutes} from "./parking-time.ts";
import {lookupParking, normalizePhone, type MemberView, type PickkoApi, type UsageSegment} from "./parking-lookup.ts";

const min = (h: number, m: number, s = 0) => (h * 60 + m) * 60 + s;

assert.equal(toRegisterMinutes(min(1, 20)), 90);
assert.equal(toRegisterMinutes(min(1, 23)), 90);
assert.equal(toRegisterMinutes(min(1, 25)), 100);
assert.equal(toRegisterMinutes(min(1, 26)), 100);
assert.equal(toRegisterMinutes(min(1, 20, 59)), 90);
assert.equal(toRegisterMinutes(min(0, 3)), 10);
assert.equal(toRegisterMinutes(0), 10);
assert.equal(toRegisterMinutes(min(2, 55)), 190);

assert.equal(formatDuration(90), "1시간 30분");
assert.equal(formatDuration(100), "1시간 40분");
assert.equal(formatDuration(120), "2시간");
assert.equal(formatDuration(10), "10분");

const NOW = Date.UTC(2026, 10, 24, 4, 0, 0) / 1000;
assert.equal(kstDateString(NOW), "2026-11-24");
assert.equal(kstDateString(Date.UTC(2026, 10, 24, 15, 30, 0) / 1000), "2026-11-25");

assert.equal(kstToEpochSec("2026-11-24 13:00:00"), NOW);
assert.equal(kstToEpochSec("2026-11-24 12:45:00"), NOW - 15 * 60);

assert.equal(normalizePhone("010-1234-5678"), "01012345678");
assert.equal(normalizePhone("010 123 4567"), "0101234567");
assert.equal(normalizePhone("02-123-4567"), null);
assert.equal(normalizePhone("1234"), null);

const seg = (tmStart: string, tmEnd: string | null, tmTime: number): UsageSegment => ({tmStart, tmEnd, tmTime});

function fakeApi(members: Record<number, {phone: string; times: UsageSegment[]}>): PickkoApi {
  return {
    async searchMembers() {
      return Object.entries(members).map(([no, m]) => ({mbNo: Number(no), mbPhone: m.phone}));
    },
    async getMemberView(mbNo): Promise<MemberView> {
      return {now: NOW, times: members[mbNo].times};
    },
  };
}

const PHONE = "010-1111-2222";

{
  const api = fakeApi({1: {phone: "010-1111-2222", times: [seg("2026-11-24 11:27:00", "2026-11-24 12:50:10", min(1, 23, 10))]}});
  assert.deepEqual(await lookupParking(api, "01011112222"), {
    ok: true, usedSeconds: min(1, 23, 10), registerMinutes: 90, startTime: "11:27", endTime: "12:50",
  });
}
{
  const api = fakeApi({1: {phone: PHONE, times: [
    seg("2026-11-24 09:00:00", "2026-11-24 10:00:00", min(1, 0)),
    seg("2026-11-24 11:30:00", "2026-11-24 12:56:00", min(1, 26)),
    seg("2026-11-23 20:00:00", "2026-11-23 23:00:00", min(3, 0)),
  ]}});
  const result = await lookupParking(api, PHONE);
  assert.deepEqual(result, {ok: true, usedSeconds: min(1, 26), registerMinutes: 100, startTime: "11:30", endTime: "12:56"});
}
{
  const api = fakeApi({1: {phone: PHONE, times: [seg("2026-11-24 09:00:00", null, 0)]}});
  assert.deepEqual(await lookupParking(api, PHONE), {ok: false, code: "IN_USE"});
}
{
  const api = fakeApi({1: {phone: PHONE, times: [
    seg("2026-11-24 09:00:00", "2026-11-24 10:00:00", min(1, 0)),
    seg("2026-11-24 12:30:00", null, 0),
  ]}});
  assert.deepEqual(await lookupParking(api, PHONE), {ok: false, code: "IN_USE"});
}
{
  const api = fakeApi({1: {phone: PHONE, times: [seg("2026-11-23 09:00:00", "2026-11-23 10:00:00", min(1, 0))]}});
  assert.deepEqual(await lookupParking(api, PHONE), {ok: false, code: "NO_USAGE_TODAY"});
}
{
  const api = fakeApi({1: {phone: "010-9999-8888", times: []}});
  assert.deepEqual(await lookupParking(api, PHONE), {ok: false, code: "NOT_FOUND"});
}
{
  const api = fakeApi({
    1: {phone: PHONE, times: [seg("2026-11-20 09:00:00", "2026-11-20 10:00:00", min(1, 0))]},
    2: {phone: PHONE, times: [seg("2026-11-24 11:30:00", "2026-11-24 12:50:00", min(1, 20))]},
    3: {phone: "010-1111-2223", times: [seg("2026-11-24 09:00:00", "2026-11-24 12:00:00", min(3, 0))]},
  });
  const result = await lookupParking(api, PHONE);
  assert.deepEqual(result, {ok: true, usedSeconds: min(1, 20), registerMinutes: 90, startTime: "11:30", endTime: "12:50"});
}
{
  const api = fakeApi({
    1: {phone: PHONE, times: [seg("2026-11-24 09:00:00", "2026-11-24 10:00:00", min(1, 0))]},
    2: {phone: PHONE, times: [seg("2026-11-24 11:00:00", "2026-11-24 12:00:00", min(1, 0))]},
  });
  assert.deepEqual(await lookupParking(api, PHONE), {ok: false, code: "MULTIPLE"});
}
{
  const within = fakeApi({1: {phone: PHONE, times: [seg("2026-11-24 11:00:00", "2026-11-24 12:45:00", min(1, 45))]}});
  const exactly15 = await lookupParking(within, PHONE);
  assert.equal(exactly15.ok, true);
  const late = fakeApi({1: {phone: PHONE, times: [seg("2026-11-24 11:00:00", "2026-11-24 12:44:59", min(1, 45))]}});
  assert.deepEqual(await lookupParking(late, PHONE), {ok: false, code: "TOO_LATE"});
  const longAgo = fakeApi({1: {phone: PHONE, times: [seg("2026-11-24 09:00:00", "2026-11-24 10:00:00", min(1, 0))]}});
  assert.deepEqual(await lookupParking(longAgo, PHONE), {ok: false, code: "TOO_LATE"});
}
assert.deepEqual(await lookupParking(fakeApi({}), "1234"), {ok: false, code: "INVALID_PHONE"});

console.log("parking checks passed");
