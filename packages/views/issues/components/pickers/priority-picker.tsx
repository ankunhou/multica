"use client";

import { useState } from "react";
import type { IssuePriority, UpdateIssueRequest } from "@multica/core/types";
import { PRIORITY_ORDER } from "@multica/core/issues/config";
import { PriorityIcon } from "../priority-icon";
import { IssuePriorityBadge } from "../priority-badge";
import { PropertyPicker, PickerItem } from "./property-picker";
import { useT } from "../../../i18n";

export function PriorityPicker({
  priority,
  onUpdate,
  trigger: customTrigger,
  triggerRender,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  align,
}: {
  priority: IssuePriority;
  onUpdate: (updates: Partial<UpdateIssueRequest>) => void;
  trigger?: React.ReactNode;
  triggerRender?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  align?: "start" | "center" | "end";
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const { t } = useT("issues");

  return (
    <PropertyPicker
      open={open}
      onOpenChange={setOpen}
      width="w-44"
      align={align}
      triggerRender={triggerRender}
      trigger={
        customTrigger ?? (
          <>
            <PriorityIcon priority={priority} className="shrink-0" />
            <span className="truncate">{t(($) => $.priority[priority])}</span>
          </>
        )
      }
    >
      {PRIORITY_ORDER.map((p) => (
        <PickerItem
          key={p}
          selected={p === priority}
          onClick={() => {
            onUpdate({ priority: p });
            setOpen(false);
          }}
        >
          <IssuePriorityBadge priority={p} />
        </PickerItem>
      ))}
    </PropertyPicker>
  );
}
