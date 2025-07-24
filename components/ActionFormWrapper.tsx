"use client";

import type { ActionResult } from "@/type";
import {
  type JSX,
  type ReactNode,
  useRef,
  useTransition,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { Spinner } from "./Spinner";

interface ActionFormWrapperProps<TData = unknown> {
  children: ReactNode;
  action: (formData: FormData) => Promise<ActionResult & TData>;
  onSuccess?: (data: ActionResult & TData, form: HTMLFormElement) => void;
  onError?: (data: ActionResult & TData) => void;
  className?: string;
  formRef?: RefObject<HTMLFormElement | null>;
}

export function ActionFormWrapper<TData = unknown>({
  children,
  action,
  onSuccess,
  onError,
  className,
  formRef: externalFormRef,
}: ActionFormWrapperProps<TData>): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const internalFormRef = useRef<HTMLFormElement>(null);
  const formRef = externalFormRef || internalFormRef;

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await action(formData);

        if (result.success) {
          toast.success(result.message);
          if (onSuccess && formRef.current) {
            onSuccess(result, formRef.current);
          } else if (formRef.current) {
            formRef.current.reset();
          }
        } else {
          toast.error(result.message || "An unknown error occurred.");
          if (onError) {
            onError(result);
          }
        }
      } catch (e) {
        console.error("ActionFormWrapper unhandled error:", e);
        const errorMsg = "An unexpected error occurred. Please try again.";
        toast.error(errorMsg);
        if (onError) {
          onError({
            success: false,
            message: errorMsg,
          } as ActionResult & TData);
        }
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className={className}
      ref={formRef}
      onSubmit={(e) => {
        if (isPending) e.preventDefault();
      }}
    >
      <div className="relative">
        {children}
        {isPending && <Spinner />}
      </div>
    </form>
  );
}
