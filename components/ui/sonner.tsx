"use client";

import { useTheme } from "next-themes";
import type { CSSProperties, JSX } from "react";
import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

export const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as CSSProperties
      }
      {...props}
    />
  );
};
