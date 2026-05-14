"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@multica/ui/components/ui/input";
import { Label } from "@multica/ui/components/ui/label";
import { Button } from "@multica/ui/components/ui/button";
import { Card, CardContent } from "@multica/ui/components/ui/card";
import { useCreateWorkspace } from "@multica/core/workspace/mutations";
import type { Workspace } from "@multica/core/types";
import { isImeComposing } from "@multica/core/utils";
import { WORKSPACE_SLUG_REGEX, isWorkspaceSlugConflict, nameToWorkspaceSlug } from "./slug";
import { useT } from "../i18n";
import { isReservedSlug } from "@multica/core/paths";

export interface CreateWorkspaceFormProps {
  onSuccess: (workspace: Workspace) => void | Promise<void>;
}

export function CreateWorkspaceForm({ onSuccess }: CreateWorkspaceFormProps) {
  const { t } = useT("workspace");
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugServerError, setSlugServerError] = useState<string | null>(null);
  const slugTouched = useRef(false);

  const slugValidationError =
    slug.length > 0 && !WORKSPACE_SLUG_REGEX.test(slug)
      ? t(($) => $.create_form.errors.slug_format)
      : null;
  const slugReservedError =
    slug.length > 0 && isReservedSlug(slug) ? t(($) => $.create_form.errors.slug_reserved) : null;
  const slugError = slugValidationError ?? slugReservedError ?? slugServerError;
  const canSubmit = name.trim().length > 0 && slug.trim().length > 0 && !slugError;

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched.current) {
      setSlug(nameToWorkspaceSlug(value));
      setSlugServerError(null);
    }
  };

  const handleSlugChange = (value: string) => {
    slugTouched.current = true;
    setSlug(value);
    setSlugServerError(null);
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    createWorkspace.mutate(
      { name: name.trim(), slug: slug.trim() },
      {
        onSuccess,
        onError: (error) => {
          if (isWorkspaceSlugConflict(error)) {
            setSlugServerError(t(($) => $.create_form.errors.slug_taken));
            toast.error(t(($) => $.create_form.errors.slug_conflict_toast));
            return;
          }
          toast.error(t(($) => $.create_form.errors.create_failed));
        },
      },
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">{t(($) => $.create_form.name_label)}</Label>
          <Input
            id="ws-name"
            autoFocus
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={t(($) => $.create_form.name_placeholder)}
            onKeyDown={(e) => {
              if (isImeComposing(e)) return;
              if (e.key === "Enter") handleCreate();
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ws-slug">{t(($) => $.create_form.url_label)}</Label>
          <div className="flex h-9 items-center overflow-hidden rounded-xl border border-input bg-background/70 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            {/* eslint-disable-next-line i18next/no-literal-string -- brand URL prefix, not translatable */}
            <span className="flex h-full select-none items-center border-r border-input/50 bg-muted/35 px-3 font-mono text-sm text-muted-foreground">
              multica.ai/
            </span>
            <Input
              id="ws-slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder={t(($) => $.create_form.url_placeholder)}
              className="h-full rounded-none border-0 bg-transparent font-mono shadow-none focus-visible:border-transparent focus-visible:ring-0"
              onKeyDown={(e) => {
                if (isImeComposing(e)) return;
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
          {slugError && <p className="text-xs text-destructive">{slugError}</p>}
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={handleCreate}
          disabled={createWorkspace.isPending || !canSubmit}
        >
          {createWorkspace.isPending
            ? t(($) => $.create_form.submitting)
            : t(($) => $.create_form.submit)}
        </Button>
      </CardContent>
    </Card>
  );
}
