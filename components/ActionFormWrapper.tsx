"use client";

import {
  type JSX,
  type ReactNode,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/db/types";

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

  const activeFormRef = useMemo(
    () => externalFormRef || internalFormRef,
    [externalFormRef],
  );

  const handleSuccess = useCallback(
    (result: ActionResult & TData) => {
      toast.success(result.message);
      const form = activeFormRef.current;
      if (onSuccess && form) {
        onSuccess(result, form);
      } else if (form) {
        requestAnimationFrame(() => {
          form.reset();
        });
      }
    },
    [onSuccess, activeFormRef],
  );

  const handleError = useCallback(
    (result: ActionResult & TData) => {
      toast.error(result.message || "An unknown error occurred.");
      if (onError) {
        onError(result);
      }
    },
    [onError],
  );

  const handleUnexpectedError = useCallback(
    (error: unknown) => {
      console.error(`ActionFormWrapper unhandled error: ${error}`);
      const errorMsg = "An unexpected error occurred. Please try again.";
      toast.error(errorMsg);
      if (onError) {
        onError({
          success: false,
          message: errorMsg,
        } as ActionResult & TData);
      }
    },
    [onError],
  );

  const handleSubmit = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          const result = await action(formData);
          if (result.success) {
            handleSuccess(result);
          } else {
            handleError(result);
          }
        } catch (error) {
          handleUnexpectedError(error);
        }
      });
    },
    [action, handleSuccess, handleError, handleUnexpectedError],
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      if (isPending) {
        e.preventDefault();
      }
    },
    [isPending],
  );

  return (
    <form
      action={handleSubmit}
      className={className}
      ref={activeFormRef}
      onSubmit={handleFormSubmit}
    >
      <div className="relative">
        {children}
        {isPending && <Spinner />}
      </div>
    </form>
  );
}
