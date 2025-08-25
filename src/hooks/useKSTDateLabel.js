// src/hooks/useKSTDateLabel.js
import { useMemo, useCallback } from "react";

const PASSTHROUGH = new Set(["처음부터", "끝까지"]);

function parseISOCompat(iso) {
  if (!iso) return new Date(NaN);
  const trimmed = iso.replace(
    /\.(\d{3})\d*(Z)?$/,
    (_, ms, z) => `.${ms}${z || ""}`
  );
  return new Date(trimmed);
}

export function useKSTDateLabel(options = {}) {
  const locale = options.locale || "ko-KR";
  const timeZone = options.timeZone || "Asia/Seoul";

  const formatter = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });
  }, [locale, timeZone]);

  const format = useCallback(
    (value) => {
      if (typeof value === "string" && PASSTHROUGH.has(value)) return value;
      if (!value) return "";

      const d = value instanceof Date ? value : parseISOCompat(value);
      if (Number.isNaN(d.getTime())) return "";

      const parts = formatter.formatToParts(d);
      const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
      return `${map.year}.${map.month}.${map.day}.`;
    },
    [formatter]
  );

  return format;
}
