"use client";

import type { ActionResult } from "@/type";
import {
  type JSX,
  type ReactNode,
  useState,
  useTransition,
  useRef,
  type RefObject,
} from "react";
import { toast } from "sonner";
import { Spinner } from "./Spinner";

interface ActionFormWrapperProps<TData = unknown> {
  children: ReactNode;
  action: (formData: FormData) => Promise<ActionResult & TData>;
  onSuccess?: (data: ActionResult & TData, form: HTMLFormElement) => void;
  onError?: (error: ActionResult & TData) => void;
  className?: string;
  formRef?: RefObject<HTMLFormElement | null>;
  submitButtonContent?: ReactNode;
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(null);
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
        }
      } catch (e) {
        const errorMsg = "An unexpected error occurred. Please try again.";
        console.error("ActionFormWrapper error:", e);
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        if (onError) {
          onError({ success: false, message: errorMsg } as ActionResult &
            TData);
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
        // If you are not using the native form action, prevent default
        // e.preventDefault(); handleSubmit(new FormData(e.currentTarget));
      }}
    >
      {children}
      {/*
        If you want a generic submit button handled by this wrapper:
        {submitButtonContent && (
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : submitButtonContent}
          </Button>
        )}
      */}
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      {isPending && (
        <div className="mt-2">
          <Spinner />
        </div>
      )}
    </form>
  );
}
