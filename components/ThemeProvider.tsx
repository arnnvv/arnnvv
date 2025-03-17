"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type { ComponentProps, JSX } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemes>): JSX.Element {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemes>
  );
}
