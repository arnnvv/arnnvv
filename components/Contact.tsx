import { getCurrentSession, sendEmailAtn } from "@/app/actions";
import type { JSX } from "react";
import { ContactFormWrapper } from "./MailWrapper";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { globalGETRateLimit } from "@/lib/request";

export function ContactFormSkeleton(): JSX.Element {
  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto animate-pulse">
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="h-9 bg-gray-300 dark:bg-zinc-700 rounded-lg" />
        <div className="h-9 bg-gray-300 dark:bg-zinc-700 rounded-lg" />
        <div className="h-[140px] bg-gray-300 dark:bg-zinc-700 rounded-lg" />
        <div className="h-10 bg-gray-300 dark:bg-zinc-700 rounded-lg" />
      </div>
    </div>
  );
}

export async function ContactFormContent(): Promise<JSX.Element | string> {
  const { session, user } = await getCurrentSession();

  if (!(await globalGETRateLimit())) {
    return "Rate Limited! Don't Spam";
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <ContactFormWrapper action={sendEmailAtn}>
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              name="email"
              placeholder="Your Email"
              className="border-gray-200 dark:border-zinc-800 bg-secondary dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
              required
              defaultValue={session ? user.email : ""}
              readOnly={!!session}
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Message"
              name="message"
              className="min-h-[120px] sm:min-h-[140px] md:min-h-[160px] border-gray-200 dark:border-zinc-800 bg-secondary dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-secondary dark:bg-zinc-900 text-gray-600 dark:text-zinc-200 hover:bg-accent hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-zinc-800 dark:hover:border-blue-400 transition-colors duration-200 rounded-lg shadow-sm"
          >
            Send
          </Button>
        </div>
      </ContactFormWrapper>
    </div>
  );
}
