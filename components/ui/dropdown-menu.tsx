"use client";

import {
  Root as DropdownMenuRoot_dropdown,
  Portal as DropdownMenuPortal_dropdown,
  Trigger as DropdownMenuTrigger_dropdown,
  Content as DropdownMenuContent_dropdown,
  Group as DropdownMenuGroup_dropdown,
  Item as DropdownMenuItem_dropdown,
  CheckboxItem as DropdownMenuCheckboxItem_dropdown,
  RadioGroup as DropdownMenuRadioGroup_dropdown,
  RadioItem as DropdownMenuRadioItem_dropdown,
  Label as DropdownMenuLabel_dropdown,
  Separator as DropdownMenuSeparator_dropdown,
  Sub as DropdownMenuSub_dropdown,
  SubTrigger as DropdownMenuSubTrigger_dropdown,
  SubContent as DropdownMenuSubContent_dropdown,
  ItemIndicator as DropdownMenuItemIndicator_dropdown,
} from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps, JSX } from "react";

function DropdownMenu({
  ...props
}: ComponentProps<typeof DropdownMenuRoot_dropdown>): JSX.Element {
  return <DropdownMenuRoot_dropdown data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: ComponentProps<typeof DropdownMenuPortal_dropdown>): JSX.Element {
  return (
    <DropdownMenuPortal_dropdown data-slot="dropdown-menu-portal" {...props} />
  );
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
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal_dropdown>
  );
}

function DropdownMenuGroup({
  ...props
}: ComponentProps<typeof DropdownMenuGroup_dropdown>): JSX.Element {
  return (
    <DropdownMenuGroup_dropdown data-slot="dropdown-menu-group" {...props} />
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
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof DropdownMenuCheckboxItem_dropdown>): JSX.Element {
  return (
    <DropdownMenuCheckboxItem_dropdown
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuItemIndicator_dropdown>
          <CheckIcon className="size-4" />
        </DropdownMenuItemIndicator_dropdown>
      </span>
      {children}
    </DropdownMenuCheckboxItem_dropdown>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: ComponentProps<typeof DropdownMenuRadioGroup_dropdown>): JSX.Element {
  return (
    <DropdownMenuRadioGroup_dropdown
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuRadioItem_dropdown>): JSX.Element {
  return (
    <DropdownMenuRadioItem_dropdown
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuItemIndicator_dropdown>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuItemIndicator_dropdown>
      </span>
      {children}
    </DropdownMenuRadioItem_dropdown>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuLabel_dropdown> & {
  inset?: boolean;
}): JSX.Element {
  return (
    <DropdownMenuLabel_dropdown
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSeparator_dropdown>): JSX.Element {
  return (
    <DropdownMenuSeparator_dropdown
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: ComponentProps<"span">): JSX.Element {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: ComponentProps<typeof DropdownMenuSub_dropdown>): JSX.Element {
  return <DropdownMenuSub_dropdown data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuSubTrigger_dropdown> & {
  inset?: boolean;
}): JSX.Element {
  return (
    <DropdownMenuSubTrigger_dropdown
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuSubTrigger_dropdown>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuSubContent_dropdown>): JSX.Element {
  return (
    <DropdownMenuSubContent_dropdown
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
