"use client";

import type { ActionResult } from "@/type";
import { type JSX, type ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "./Spinner";

export const ContactFormWrapper = ({
  children,
  action,
}: {
  children: ReactNode;
  action: (formdata: FormData) => Promise<ActionResult>;
}): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const [, setFormState] = useState<ActionResult>({
    success: false,
    message: "",
  });

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await action(formData);
        setFormState(result);

        if (result.success) {
          toast.success(result.message, {
            id: "success-toast",
            action: {
              label: "Close",
              onClick: () => toast.dismiss("success-toast"),
            },
          });

          const form = document.querySelector("form") as HTMLFormElement;
          if (form) form.reset();
        } else if (result.message) {
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
    <form action={handleSubmit}>
      {children}
      {isPending && <Spinner />}
    </form>
  );
};
