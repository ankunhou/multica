import { Meter } from "@multica/ui/components/ui/meter";
import { cn } from "@multica/ui/lib/utils";

export function getProjectProgressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function ProjectProgressMeter({
  done,
  total,
  className,
}: {
  done: number;
  total: number;
  className?: string;
}) {
  return (
    <Meter
      value={getProjectProgressPercent(done, total)}
      className={cn("h-1.5", className)}
      indicatorClassName="bg-success"
    />
  );
}
