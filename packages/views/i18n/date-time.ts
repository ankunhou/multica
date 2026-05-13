"use client";

import { useMemo } from "react";
import { useT } from ".";

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function useDateTimeFormatters() {
  const { i18n } = useT("common");
  const locale = i18n.language;

  return useMemo(() => {
    const shortDate = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
    });
    const dateTime = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const relative = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style: "short",
    });

    return {
      shortDate(value: string | Date): string {
        return shortDate.format(toDate(value));
      },
      dateTime(value: string | Date): string {
        return dateTime.format(toDate(value));
      },
      relativeTime(value: string | Date): string {
        const diffMs = toDate(value).getTime() - Date.now();
        const absMs = Math.abs(diffMs);
        const minuteMs = 60_000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;

        if (absMs < minuteMs) return relative.format(0, "minute");
        if (absMs < hourMs) return relative.format(Math.round(diffMs / minuteMs), "minute");
        if (absMs < dayMs) return relative.format(Math.round(diffMs / hourMs), "hour");
        return relative.format(Math.round(diffMs / dayMs), "day");
      },
    };
  }, [locale]);
}
