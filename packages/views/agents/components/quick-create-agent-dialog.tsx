"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { CreateAgentRequest, RuntimeDevice } from "@multica/core/types";
import { api } from "@multica/core/api";
import { isImeComposing } from "@multica/core/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { Button } from "@multica/ui/components/ui/button";
import { Textarea } from "@multica/ui/components/ui/textarea";
import { toast } from "sonner";
import { CharCounter } from "./char-counter";
import { useT } from "../../i18n";

const QUICK_AGENT_PROMPT_MAX = 1000;

function normalizePrompt(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function canUseRuntime(runtime: RuntimeDevice, currentUserId: string | null): boolean {
  if (!currentUserId) return true;
  if (runtime.owner_id === currentUserId) return true;
  return runtime.visibility === "public";
}

function pickRuntime(
  runtimes: RuntimeDevice[],
  currentUserId: string | null,
): RuntimeDevice | null {
  return (
    [...runtimes]
      .filter((runtime) => canUseRuntime(runtime, currentUserId))
      .sort((a, b) => {
        const aMine = a.owner_id === currentUserId;
        const bMine = b.owner_id === currentUserId;
        if (aMine !== bMine) return aMine ? -1 : 1;
        const aOnline = a.status === "online";
        const bOnline = b.status === "online";
        if (aOnline !== bOnline) return aOnline ? -1 : 1;
        return a.name.localeCompare(b.name);
      })[0] ?? null
  );
}

export function QuickCreateAgentDialog({
  runtimes,
  runtimesLoading,
  currentUserId,
  onClose,
  onCreate,
}: {
  runtimes: RuntimeDevice[];
  runtimesLoading?: boolean;
  currentUserId: string | null;
  onClose: () => void;
  onCreate: (data: CreateAgentRequest) => Promise<void>;
}) {
  const { t } = useT("agents");
  const [prompt, setPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const selectedRuntime = useMemo(
    () => pickRuntime(runtimes, currentUserId),
    [runtimes, currentUserId],
  );
  const normalizedPrompt = normalizePrompt(prompt);
  const promptLength = [...prompt].length;
  const promptOverLimit = promptLength > QUICK_AGENT_PROMPT_MAX;

  const handleSubmit = async () => {
    if (!normalizedPrompt || promptOverLimit || !selectedRuntime) return;

    setCreating(true);
    try {
      const draft = await api.generateAgentDraft({ prompt: normalizedPrompt });
      if (!draft.name.trim() || !draft.description.trim() || !draft.instructions.trim()) {
        throw new Error(t(($) => $.quick_create_dialog.generate_failed_toast));
      }

      await onCreate({
        name: draft.name.trim(),
        description: draft.description.trim(),
        instructions: draft.instructions.trim(),
        runtime_id: selectedRuntime.id,
        visibility: "private",
        template: "quick_create",
      });
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t(($) => $.quick_create_dialog.create_failed_toast),
      );
      setCreating(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            {t(($) => $.quick_create_dialog.title)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Textarea
              autoFocus
              aria-label={t(($) => $.quick_create_dialog.prompt_label)}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t(($) => $.quick_create_dialog.prompt_placeholder)}
              maxLength={QUICK_AGENT_PROMPT_MAX + 1}
              className="min-h-28 resize-none"
              onKeyDown={(event) => {
                if (isImeComposing(event)) return;
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs text-muted-foreground">
                {runtimesLoading
                  ? t(($) => $.quick_create_dialog.runtime_loading)
                  : selectedRuntime
                    ? t(($) => $.quick_create_dialog.runtime_selected, {
                        name: selectedRuntime.name,
                      })
                    : t(($) => $.quick_create_dialog.runtime_none)}
              </p>
              <CharCounter length={promptLength} max={QUICK_AGENT_PROMPT_MAX} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t(($) => $.quick_create_dialog.cancel)}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || !normalizedPrompt || promptOverLimit || !selectedRuntime}
          >
            {creating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {creating
              ? t(($) => $.quick_create_dialog.creating)
              : t(($) => $.quick_create_dialog.create)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
