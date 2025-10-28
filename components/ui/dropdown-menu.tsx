"use client";

import {
  Content as DropdownMenuContent_dropdown,
  Item as DropdownMenuItem_dropdown,
  Portal as DropdownMenuPortal_dropdown,
  Root as DropdownMenuRoot_dropdown,
  Trigger as DropdownMenuTrigger_dropdown,
} from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, JSX } from "react";
import { cn } from "@/lib/utils";

function DropdownMenu({
  ...props
}: ComponentProps<typeof DropdownMenuRoot_dropdown>): JSX.Element {
  return <DropdownMenuRoot_dropdown data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: ComponentProps<typeof DropdownMenuTrigger_dropdown>): JSX.Element {
  return (
    <DropdownMenuTrigger_dropdown
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuContent_dropdown>): JSX.Element {
  return (
    <DropdownMenuPortal_dropdown>
      <DropdownMenuContent_dropdown
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal_dropdown>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ComponentProps<typeof DropdownMenuItem_dropdown> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}): JSX.Element {
  return (
    <DropdownMenuItem_dropdown
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
