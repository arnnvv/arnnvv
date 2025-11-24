import {
  Children,
  cloneElement,
  type ComponentProps,
  isValidElement,
  type JSX,
  type ReactElement,
} from "react";

import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

const variantStyles = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  destructive:
    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  outline:
    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
  secondary:
    "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "text-primary underline-offset-4 hover:underline",
} as const;

const sizeStyles = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

function getButtonClasses(
  variant: ButtonVariant = "default",
  size: ButtonSize = "default",
  className?: string,
): string {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps): JSX.Element | null {
  if (asChild) {
    const { children, ...restProps } = props;
    const childElement = Children.only(children) as ReactElement;

    if (!isValidElement(childElement)) {
      console.error(
        "Button 'asChild' prop requires a single valid React element child.",
      );
      return null;
    }

    return cloneElement(childElement, {
      ...(childElement.props as Record<string, unknown>),
      ...restProps,
      "data-slot": "button",
      className: cn(
        getButtonClasses(variant, size, className),
        (childElement.props as { className?: string }).className,
      ),
    } as Partial<unknown>);
  }

  return (
    <button
      data-slot="button"
      className={getButtonClasses(variant, size, className)}
      {...props}
    />
  );
}
