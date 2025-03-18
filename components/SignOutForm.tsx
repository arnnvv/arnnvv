"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { JSX, ReactNode } from "react";
import type { ActionResult } from "@/type";
import { Spinner } from "./Spinner";

export const SignOutFormComponent = ({
  children,
  action,
}: {
  children: ReactNode;
  action: () => Promise<ActionResult>;
}): JSX.Element => {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const result = await action();

        if (result.success) {
          toast.success(result.message, {
            id: "success-toast",
            action: {
              label: "Close",
              onClick: () => toast.dismiss("success-toast"),
            },
          });
        } else {
          toast.error(result.message, {
            id: "error-toast",
            action: {
              label: "Close",
              onClick: () => toast.dismiss("error-toast"),
            },
          });
        }
      } catch {
        toast.error("An unexpected error occurred", {
          id: "error-toast",
          action: {
            label: "Close",
            onClick: () => toast.dismiss("error-toast"),
          },
        });
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {children}
      {isPending && <Spinner />}
    </form>
  );
};
