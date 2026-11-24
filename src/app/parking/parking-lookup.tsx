"use client";
import {useState, type FormEvent} from "react";
import {formatDuration, REQUEST_WINDOW_MINUTES} from "@/lib/parking-time.ts";

type ApiResponse =
  | {ok: true; usedSeconds: number; registerMinutes: number; startTime: string; endTime: string}
  | {ok: false; code: string};

const MESSAGES: Record<string, string> = {
  INVALID_PHONE: "전화번호를 다시 확인해 주세요.",
  NOT_FOUND: "회원 정보를 찾지 못했어요. 가입할 때 쓴 전화번호가 맞는지 확인해 주세요.",
  MULTIPLE: "회원 정보를 하나로 확인하지 못했어요. 관리자에게 문의해 주세요.",
  NO_USAGE_TODAY: "오늘 이용 기록이 없어요. 이용 후 퇴실하고 다시 요청해 주세요.",
  IN_USE: "아직 이용 중이에요. 퇴실한 뒤 다시 요청해 주세요.",
  TOO_LATE: `퇴실 후 ${REQUEST_WINDOW_MINUTES}분이 지나 조회할 수 없어요. 관리자에게 문의해 주세요.`,
  TOO_MANY: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.",
};
const FALLBACK_MESSAGE = "일시적인 문제로 조회하지 못했어요. 잠시 후 다시 시도해 주세요.";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function ParkingLookup() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setResult(null);
    setFailure(null);
    try {
      const response = await fetch("/api/parking/lookup", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({phone}),
      });
      const data = (await response.json()) as ApiResponse;
      if (data.ok) setResult(data);
      else setFailure(MESSAGES[data.code] ?? FALLBACK_MESSAGE);
    } catch {
      setFailure(FALLBACK_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return <div className="pk-card">
    <h1 className="pk-title">오늘 이용한 시간과<br />주차 시간을 확인해요</h1>
    <p className="pk-desc">회원 전화번호를 입력하면 오늘 이용 시간과 등록될 주차 시간을 보여드려요.</p>
    <p className="pk-notice" role="note"><strong>꼭 퇴실 처리 후 {REQUEST_WINDOW_MINUTES}분 이내에 요청해 주세요.</strong> 이용 중이거나 외출 중이면 조회할 수 없고, {REQUEST_WINDOW_MINUTES}분이 지나면 관리자에게 문의해야 해요.</p>
    <form className="pk-form" onSubmit={submit}>
      <label className="pk-label" htmlFor="phone">전화번호</label>
      <input id="phone" className="pk-input" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000"
        value={phone} onChange={event => setPhone(formatPhone(event.target.value))} />
      <button className="pk-submit" type="submit" disabled={loading || phone.replace(/\D/g, "").length < 10}>{loading ? "조회하는 중…" : "조회하기"}</button>
    </form>
    <div aria-live="polite">
      {failure && <p className="pk-error">{failure}</p>}
      {result?.ok && <dl className="pk-result">
        <div className="pk-row"><dt>오늘 이용 시간</dt><dd>{formatDuration(Math.floor(result.usedSeconds / 60))}</dd></div>
        <div className="pk-row"><dt>이용 시각</dt><dd>{result.startTime} – {result.endTime}</dd></div>
        <div className="pk-row pk-row-main"><dt>등록 예정 주차 시간</dt><dd>{formatDuration(result.registerMinutes)}</dd></div>
      </dl>}
    </div>
    <p className="pk-note">입력한 전화번호는 조회에만 사용해요.<br />과도한 요청을 막기 위해 접속 정보와 변환한 번호 값이 10분간만 임시 보관돼요.</p>
  </div>;
}
