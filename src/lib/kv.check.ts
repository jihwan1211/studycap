import assert from "node:assert/strict";

delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
const {countInWindow, kvBackend} = await import("./kv.ts");
const {allow} = await import("./rate-limit.ts");

assert.equal(kvBackend(), "memory");
assert.equal(await countInWindow("k1", 60), 1);
assert.equal(await countInWindow("k1", 60), 2);
assert.equal(await countInWindow("k2", 60), 1);
assert.equal(await allow("ip:a", 2, 60_000), true);
assert.equal(await allow("ip:a", 2, 60_000), true);
assert.equal(await allow("ip:a", 2, 60_000), false);
assert.equal(await allow("ip:b", 2, 60_000), true);

type Call = {url: string; auth: string | null; body: unknown};
const calls: Call[] = [];
let ttlReply: number = -1;
let failWith: number | null = null;
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body));
  calls.push({url: String(input), auth: new Headers(init?.headers).get("authorization"), body});
  if (failWith !== null) return new Response("nope", {status: failWith});
  const reply = (body as unknown[][]).map(command => {
    if (command[0] === "INCR") return {result: calls.length};
    if (command[0] === "TTL") return {result: ttlReply};
    return {result: 1};
  });
  return new Response(JSON.stringify(reply), {status: 200});
}) as typeof fetch;

process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io/";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
assert.equal(kvBackend(), "upstash");

assert.equal(await countInWindow("rl:x", 600), 1);
assert.equal(calls.length, 2);
assert.equal(calls[0].url, "https://example.upstash.io/pipeline");
assert.equal(calls[0].auth, "Bearer test-token");
assert.deepEqual(calls[0].body, [["INCR", "rl:x"], ["TTL", "rl:x"]]);
assert.deepEqual(calls[1].body, [["EXPIRE", "rl:x", 600]]);

calls.length = 0;
ttlReply = 300;
await countInWindow("rl:x", 600);
assert.equal(calls.length, 1);

failWith = 500;
assert.equal(await allow("ip:z", 1, 60_000), true);
await assert.rejects(() => countInWindow("rl:x", 600), /Upstash 요청 실패/);

globalThis.fetch = realFetch;
console.log("kv checks passed");
