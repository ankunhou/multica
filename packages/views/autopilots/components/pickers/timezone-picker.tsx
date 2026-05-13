"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@multica/ui/lib/utils";
import {
  PropertyPicker,
  PickerEmpty,
} from "../../../issues/components/pickers/property-picker";
import { useT } from "../../../i18n";

export interface TimezonePickerProps {
  value: string;
  onChange: (tz: string) => void;
  options: string[];
  disabled?: boolean;
  className?: string;
}

function offsetFor(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

const TIMEZONE_CITY_KEYS = [
  "UTC",
  "New_York",
  "Chicago",
  "Denver",
  "Los_Angeles",
  "Sao_Paulo",
  "London",
  "Paris",
  "Berlin",
  "Moscow",
  "Dubai",
  "Kolkata",
  "Singapore",
  "Shanghai",
  "Tokyo",
  "Seoul",
  "Sydney",
  "Auckland",
] as const;

type TimezoneCityKey = (typeof TIMEZONE_CITY_KEYS)[number];

function cityKey(tz: string): TimezoneCityKey | null {
  if (tz === "UTC") return "UTC";
  const key = tz.split("/").pop() ?? "";
  return TIMEZONE_CITY_KEYS.includes(key as TimezoneCityKey)
    ? (key as TimezoneCityKey)
    : null;
}

function fallbackCityLabel(tz: string): string {
  if (tz === "UTC") return "UTC";
  return tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
}

export function TimezonePicker({
  value,
  onChange,
  options,
  disabled,
  className,
}: TimezonePickerProps) {
  const { t } = useT("autopilots");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const getCityLabel = useCallback((tz: string) => {
    const key = cityKey(tz);
    return key ? t(($) => $.timezone_picker.cities[key]) : fallbackCityLabel(tz);
  }, [t]);

  const selectedCity = getCityLabel(value);
  const selectedOffset = useMemo(() => offsetFor(value), [value]);

  const query = filter.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter((tz) => {
      const haystack = `${tz} ${getCityLabel(tz)} ${fallbackCityLabel(tz)} ${offsetFor(tz)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [getCityLabel, options, query]);

  return (
    <PropertyPicker
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setFilter("");
      }}
      width="w-64"
      align="start"
      searchable
      searchPlaceholder={t(($) => $.timezone_picker.search_placeholder)}
      onSearchChange={setFilter}
      triggerRender={
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-8 w-full items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none",
            "hover:bg-accent/30",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-input/30",
            className,
          )}
        />
      }
      trigger={
        <>
          <Globe className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-left">{selectedCity}</span>
          {selectedOffset && (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {selectedOffset}
            </span>
          )}
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        </>
      }
    >
      {filteredOptions.length === 0 ? (
        <PickerEmpty />
      ) : (
        filteredOptions.map((tz) => {
          const off = offsetFor(tz);
          const isSelected = tz === value;
          return (
            <button
              key={tz}
              type="button"
              data-picker-item
              onClick={() => {
                onChange(tz);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex size-3.5 shrink-0 items-center justify-center">
                {isSelected && (
                  <Check className="size-3.5 text-foreground" />
                )}
              </span>
              <span className="flex-1 truncate text-left">{getCityLabel(tz)}</span>
              {off && (
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {off}
                </span>
              )}
            </button>
          );
        })
      )}
    </PropertyPicker>
  );
}
