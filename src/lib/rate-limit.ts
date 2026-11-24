import {countInWindow} from "./kv.ts";

export async function allow(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const count = await countInWindow(`rl:${key}`, Math.ceil(windowMs / 1000));
    return count <= limit;
  } catch (error) {
    console.error("[rate-limit] 저장소 오류, 제한 없이 통과:", error instanceof Error ? error.message : "unknown");
    return true;
  }
}
