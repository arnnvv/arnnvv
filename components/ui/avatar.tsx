"use client";

import Image from "next/image";
import {
  Children,
  type ComponentProps,
  cloneElement,
  type FC,
  isValidElement,
  type JSX,
  type ReactElement,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type AvatarRootProps = ComponentProps<"div">;
type AvatarImageProps = ComponentProps<typeof Image> & {
  _setImageStatus?: (status: ImageStatus) => void;
};
type AvatarFallbackProps = ComponentProps<"span">;
type ImageStatus = "loading" | "success" | "error";

function Avatar({
  className,
  children,
  ...props
}: AvatarRootProps): JSX.Element {
  const childrenArray = Children.toArray(children);
  const hasImage = childrenArray.some(
    (child) =>
      isValidElement(child) &&
      ((child.type as FC)?.displayName === "AvatarImage" ||
        child.type === AvatarImage),
  );

  const [imageStatus, setImageStatus] = useState<ImageStatus>(
    hasImage ? "loading" : "error",
  );

  const processedChildren = childrenArray.map((child) => {
    if (!isValidElement(child)) {
      return child;
    }

    if (
      (child.type as FC)?.displayName === "AvatarImage" ||
      child.type === AvatarImage
    ) {
      return cloneElement(child as ReactElement<AvatarImageProps>, {
        _setImageStatus: setImageStatus,
      });
    }

    if (
      (child.type as FC)?.displayName === "AvatarFallback" ||
      child.type === AvatarFallback
    ) {
      if (imageStatus === "success") {
        return null;
      }
      return child;
    }

    return child;
  });

  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {processedChildren}
    </div>
  );
}

function AvatarImage({
  className,
  _setImageStatus,
  onLoadingComplete,
  onError,
  alt,
  ...props
}: AvatarImageProps): JSX.Element {
  return (
    <Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      alt={alt}
      onLoadingComplete={(result) => {
        if (_setImageStatus) {
          _setImageStatus("success");
        }
        if (onLoadingComplete) {
          onLoadingComplete(result);
        }
      }}
      onError={(event) => {
        if (_setImageStatus) {
          _setImageStatus("error");
        }
        if (onError) {
          onError(event);
        }
      }}
      {...props}
    />
  );
}
AvatarImage.displayName = "AvatarImage";

function AvatarFallback({
  className,
  ...props
}: AvatarFallbackProps): JSX.Element {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
