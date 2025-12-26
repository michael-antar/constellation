"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface SpoilerProps {
  children: React.ReactNode;
  className?: string;
}

export const Spoiler = ({ children, className }: SpoilerProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span
      onClick={() => setIsRevealed(true)}
      className={cn(
        "transition-all duration-300 rounded px-1 cursor-pointer",
        // When hidden
        !isRevealed &&
          "bg-muted-foreground/20 text-transparent select-none hover:bg-muted-foreground/30",
        // When revealed
        isRevealed && "bg-transparent text-foreground",
        className
      )}
      title={!isRevealed ? "Click to reveal spoiler" : undefined}
    >
      {children}
    </span>
  );
};
