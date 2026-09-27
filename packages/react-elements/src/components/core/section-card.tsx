"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "../../lib/utils";

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  headerClassName,
  contentClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border-border/70 bg-card/80 py-0 shadow-sm",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-start justify-between gap-3 p-4 sm:p-5",
          headerClassName,
        )}
      >
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description ? (
            <CardDescription data-slot="card-description">
              {description}
            </CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn("p-4 pt-0 sm:p-5 sm:pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
