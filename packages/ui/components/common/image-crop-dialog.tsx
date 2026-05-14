"use client";

import * as React from "react";

import { Button } from "@multica/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { Label } from "@multica/ui/components/ui/label";
import { Slider } from "@multica/ui/components/ui/slider";
import { cn } from "@multica/ui/lib/utils";
import { Loader2 } from "lucide-react";

const CROP_AREA_SIZE = 256;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const OUTPUT_TYPE = "image/png";

type ImageSize = {
  width: number;
  height: number;
};

type Offset = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

interface ImageCropDialogProps {
  file: File | null;
  open: boolean;
  title: string;
  zoomLabel: string;
  cancelLabel: string;
  confirmLabel: string;
  previewAlt: string;
  previewClassName?: string;
  onOpenChange: (open: boolean) => void;
  onCrop: (file: File) => Promise<void> | void;
}

function ImageCropDialog({
  file,
  open,
  title,
  zoomLabel,
  cancelLabel,
  confirmLabel,
  previewAlt,
  previewClassName,
  onOpenChange,
  onCrop,
}: ImageCropDialogProps) {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const dragRef = React.useRef<DragState | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [imageSize, setImageSize] = React.useState<ImageSize | null>(null);
  const [offset, setOffset] = React.useState<Offset>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(MIN_ZOOM);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);
    setImageSize(null);
    setOffset({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);

    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  const displayedSize = React.useMemo(() => {
    if (!imageSize) return { width: CROP_AREA_SIZE, height: CROP_AREA_SIZE };

    const aspect = imageSize.width / imageSize.height;
    if (aspect >= 1) {
      return {
        width: CROP_AREA_SIZE * aspect * zoom,
        height: CROP_AREA_SIZE * zoom,
      };
    }

    return {
      width: CROP_AREA_SIZE * zoom,
      height: (CROP_AREA_SIZE / aspect) * zoom,
    };
  }, [imageSize, zoom]);

  const clampOffset = React.useCallback(
    (next: Offset): Offset => {
      const maxX = Math.max(0, (displayedSize.width - CROP_AREA_SIZE) / 2);
      const maxY = Math.max(0, (displayedSize.height - CROP_AREA_SIZE) / 2);

      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [displayedSize.height, displayedSize.width],
  );

  React.useEffect(() => {
    setOffset((current) => clampOffset(current));
  }, [clampOffset]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSize || saving) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setOffset(
      clampOffset({
        x: drag.originX + event.clientX - drag.startX,
        y: drag.originY + event.clientY - drag.startY,
      }),
    );
  };

  const stopDragging = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  };

  const createCroppedFile = async () => {
    if (!file || !imageSize || !imageRef.current) {
      throw new Error("Image is not ready");
    }

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported");

    const scale = displayedSize.width / imageSize.width;
    const sourceSize = CROP_AREA_SIZE / scale;
    const rawSourceX = (displayedSize.width / 2 - CROP_AREA_SIZE / 2 - offset.x) / scale;
    const rawSourceY = (displayedSize.height / 2 - CROP_AREA_SIZE / 2 - offset.y) / scale;
    const sourceX = clamp(rawSourceX, 0, imageSize.width - sourceSize);
    const sourceY = clamp(rawSourceY, 0, imageSize.height - sourceSize);

    ctx.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, OUTPUT_TYPE);
    });

    if (!blob) throw new Error("Failed to crop image");

    return new File([blob], croppedFileName(file.name), { type: OUTPUT_TYPE });
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const cropped = await createCroppedFile();
      await onCrop(cropped);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (saving && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[360px]" showCloseButton={!saving}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={cn(
              "relative mx-auto size-64 touch-none overflow-hidden rounded-xl border bg-muted shadow-inner ring-1 ring-border/60",
              imageSize && !saving ? "cursor-grab active:cursor-grabbing" : "cursor-default",
              previewClassName,
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            {objectUrl && (
              <img
                ref={imageRef}
                src={objectUrl}
                alt={previewAlt}
                className="absolute max-w-none select-none"
                draggable={false}
                onLoad={(event) => {
                  setImageSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  });
                }}
                style={{
                  width: `${displayedSize.width}px`,
                  height: `${displayedSize.height}px`,
                  left: `calc(50% + ${offset.x}px)`,
                  top: `calc(50% + ${offset.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/15" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{zoomLabel}</Label>
            <Slider
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={[zoom]}
              onValueChange={(value) => {
                setZoom(Array.isArray(value) ? (value[0] ?? MIN_ZOOM) : value);
              }}
              disabled={!imageSize || saving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            {cancelLabel}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!imageSize || saving}>
            {saving && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function croppedFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;

  return `${baseName || "image"}-cropped.png`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export { ImageCropDialog };
