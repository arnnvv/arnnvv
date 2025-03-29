import { ContactFormWrapper } from "@/components/MailWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { JSX } from "react";
import { getCurrentSession, sendEmailAtn } from "@/app/actions";

export default async function ContactForm(): Promise<JSX.Element> {
  const { session, user } = await getCurrentSession();

  return (
    <main className="bg-gray-100 dark:bg-zinc-950 flex-grow flex items-center py-6 sm:py-8 md:py-12 px-4">
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <ContactFormWrapper action={sendEmailAtn}>
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Your Email"
                className="border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
                required
                defaultValue={session ? user.email : ""}
                readOnly={session}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                name="subject"
                placeholder="Subject"
                className="border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Message"
                name="message"
                className="min-h-[120px] sm:min-h-[140px] md:min-h-[160px] border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-200 hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200 rounded-lg shadow-sm"
            >
              Send
            </Button>
          </div>
        </ContactFormWrapper>
      </div>
    </main>
  );
}
