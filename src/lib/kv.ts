type Command = (string | number)[];
type MemoryCounter = {count: number; resetAt: number};

const UPSTASH_TIMEOUT_MS = 5_000;
const MEMORY_MAX_KEYS = 5_000;
const memory = new Map<string, MemoryCounter>();

function upstashConfig(): {url: string; token: string} | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? {url: url.replace(/\/+$/, ""), token} : null;
}

async function pipeline(config: {url: string; token: string}, commands: Command[]): Promise<unknown[]> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {authorization: `Bearer ${config.token}`, "content-type": "application/json"},
    body: JSON.stringify(commands),
    cache: "no-store",
    signal: AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Upstash 요청 실패 (status ${response.status})`);
  const results = (await response.json()) as {result?: unknown; error?: string}[];
  const failed = results.find(item => item.error);
  if (failed) throw new Error(`Upstash 오류: ${failed.error}`);
  return results.map(item => item.result);
}

function memoryCount(key: string, windowSec: number): number {
  const now = Date.now();
  const current = memory.get(key);
  if (current === undefined || current.resetAt <= now) {
    memory.set(key, {count: 1, resetAt: now + windowSec * 1000});
    if (memory.size > MEMORY_MAX_KEYS) {
      for (const [k, counter] of memory) if (counter.resetAt <= now) memory.delete(k);
    }
    return 1;
  }
  current.count += 1;
  return current.count;
}

export async function countInWindow(key: string, windowSec: number): Promise<number> {
  const config = upstashConfig();
  if (config === null) return memoryCount(key, windowSec);

  const [count, ttl] = await pipeline(config, [["INCR", key], ["TTL", key]]);
  if (typeof count !== "number") throw new Error("Upstash 응답 형식이 다릅니다: INCR");
  if (ttl === -1) await pipeline(config, [["EXPIRE", key, windowSec]]);
  return count;
}

export function kvBackend(): "upstash" | "memory" {
  return upstashConfig() === null ? "memory" : "upstash";
}
