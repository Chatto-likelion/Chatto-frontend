// src/hooks/useKSTDateLabel.js
import { useMemo, useCallback } from "react";

const PASSTHROUGH = new Set(["처음부터", "끝까지"]);

function parseISOCompat(iso) {
  if (!iso) return new Date(NaN);
  // 예: 2025-08-15T07:08:08.348451Z → 밀리초 3자리만 남기기
  const trimmed = iso.replace(
    /\.(\d{3})\d*(Z)?$/,
    (_, ms, z) => `.${ms}${z || ""}`
  );
  return new Date(trimmed);
}

export function useKSTDateLabel(options = {}) {
  const locale = options.locale || "ko-KR";
  const timeZone = options.timeZone || "Asia/Seoul";

  // 날짜만(연/월/일) 포맷터
  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }, [locale, timeZone]);

  // value: ISO 문자열 or Date or 위 2개 특수 문자열
  const format = useCallback(
    (value) => {
      if (typeof value === "string" && PASSTHROUGH.has(value)) return value;
      if (!value) return "";

      const d = value instanceof Date ? value : parseISOCompat(value);
      if (Number.isNaN(d.getTime())) return "";

      const parts = formatter.formatToParts(d);
      const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
      // 결과: "25.08.15."
      return `${map.year}.${map.month}.${map.day}.`;
    },
    [formatter]
  );

  return format;
}
