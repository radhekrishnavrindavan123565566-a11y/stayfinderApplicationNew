"use client";
import { Clock } from "lucide-react";

interface Props {
  avgResponseTimeHours?: number | null;
  responseRate?: number | null;
}

export default function ResponseRateBadge({ avgResponseTimeHours, responseRate }: Props) {
  if (!avgResponseTimeHours && !responseRate) return null;

  const label =
    avgResponseTimeHours == null ? null :
    avgResponseTimeHours < 1 ? "Replies within 1 hour" :
    avgResponseTimeHours < 2 ? "Replies within 2 hours" :
    avgResponseTimeHours < 6 ? "Replies within 6 hours" :
    avgResponseTimeHours < 24 ? "Replies within a day" : null;

  if (!label) return null;

  const color =
    avgResponseTimeHours! < 1 ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-800" :
    avgResponseTimeHours! < 6 ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
      <Clock className="w-3 h-3" />
      {label}
    </span>
  );
}
