"use client";

import {
  Image as AvatarImageT,
  Fallback as AvatarFallbackT,
  Root as AvatarRoot,
} from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import type { ComponentProps, JSX } from "react";

function Avatar({
  className,
  ...props
}: ComponentProps<typeof AvatarRoot>): JSX.Element {
  return (
    <AvatarRoot
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof AvatarImageT>): JSX.Element {
  return (
    <AvatarImageT
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarFallbackT>): JSX.Element {
  return (
    <AvatarFallbackT
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
