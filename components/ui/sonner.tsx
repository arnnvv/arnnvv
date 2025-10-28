"use client";

import type { CSSProperties, JSX } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "../ThemeProvider";

export const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const { theme } = useTheme();

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
