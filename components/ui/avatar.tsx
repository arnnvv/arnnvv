"use client";

import Image from "next/image";
import {
  type ComponentProps,
  createContext,
  type JSX,
  useContext,
  useEffect,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type ImageStatus = "loading" | "success" | "error";

interface AvatarContextValue {
  imageStatus: ImageStatus;
  setImageStatus: (status: ImageStatus) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatarContext must be used within an Avatar provider");
  }
  return context;
};

type AvatarRootProps = ComponentProps<"div">;

function Avatar({ className, ...props }: AvatarRootProps): JSX.Element {
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");

  return (
    <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
      <div
        data-slot="avatar"
        className={cn(
          "relative flex size-8 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
}

type AvatarImageProps = ComponentProps<typeof Image>;

function AvatarImage({
  className,
  onLoadingComplete,
  onError,
  alt,
  ...props
}: AvatarImageProps): JSX.Element {
  const { setImageStatus } = useAvatarContext();

  useEffect(() => {
    setImageStatus("loading");
    return () => setImageStatus("loading");
  }, [setImageStatus]);

  return (
    <Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      alt={alt}
      onLoadingComplete={(result) => {
        setImageStatus("success");
        onLoadingComplete?.(result);
      }}
      onError={(event) => {
        setImageStatus("error");
        onError?.(event);
      }}
      {...props}
    />
  );
}

type AvatarFallbackProps = ComponentProps<"span">;

function AvatarFallback({
  className,
  ...props
}: AvatarFallbackProps): JSX.Element | null {
  const { imageStatus } = useAvatarContext();

  if (imageStatus === "success") {
    return null;
  }

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

export { Avatar, AvatarFallback, AvatarImage };
