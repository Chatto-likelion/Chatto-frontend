// src/hooks/useKSTDateFormat.js
import { useMemo, useCallback } from "react";

function parseISOCompat(iso) {
  if (!iso) return new Date(NaN);
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
      timeZone,
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
      return `${map.year}.${map.month}.${map.day}. ${map.hour}:${map.minute}`;
    },
    [formatter]
  );

  return format;
}
