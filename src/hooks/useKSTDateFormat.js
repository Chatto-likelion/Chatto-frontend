// src/hooks/useKSTDateFormat.js
import { useMemo, useCallback } from "react";

function parseISOCompat(iso) {
  if (!iso) return new Date(NaN);
  // 예: 2025-08-15T07:08:08.348451Z → ms(3자리)만 남기고 절단
  const trimmed = iso.replace(
    /\.(\d{3})\d*(Z)?$/,
    (_, ms, z) => `.${ms}${z || ""}`
  );
  return new Date(trimmed);
}

export function useKSTDateFormat(options = {}) {
  const locale = options.locale || "ko-KR";
  const timeZone = options.timeZone || "Asia/Seoul";

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      timeZone, // "Z"(UTC) 입력을 KST로 변환해 표시
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [locale, timeZone]);

  const format = useCallback(
    (value) => {
      if (!value) return "";
      const d = value instanceof Date ? value : parseISOCompat(value);
      if (Number.isNaN(d.getTime())) return "";

      const parts = formatter.formatToParts(d);
      const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
      // → "25.08.15. HH:MM"
      return `${map.year}.${map.month}.${map.day}. ${map.hour}:${map.minute}`;
    },
    [formatter]
  );

  return format;
}
