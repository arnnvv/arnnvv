import type { Metadata } from "next";
import type { JSX } from "react";

import { ActionFormWrapper } from "@/components/ActionFormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { sendEmailAtn } from "../actions/contact-actions";

export const metadata: Metadata = {
  title: "Contact Me | Arnav Sharma",
  description: "Get in touch. Send me a message through the contact form.",
  alternates: {
    canonical: `https://www.arnnvv.sbs/contact`,
  },
  openGraph: {
    title: "Contact Me | Arnav Sharma",
    description: "Get in touch. Send me a message through the contact form.",
    url: "https://www.arnnvv.sbs/contact",
  },
  twitter: {
    title: "Contact Me | Arnav Sharma",
    description: "Get in touch. Send me a message through the contact form.",
  },
};

export default function ContactForm(): JSX.Element {
  return (
    <main className="relative flex grow items-center overflow-hidden px-4 py-6 sm:py-8 md:py-12">
      <div className="from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 absolute inset-0 bg-linear-to-br via-transparent" />
      <div className="bg-primary/10 animate-float absolute top-20 left-10 h-20 w-20 rounded-full blur-xl" />
      <div
        className="bg-accent/10 animate-float absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          <ActionFormWrapper action={sendEmailAtn}>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="bg-secondary rounded-lg border-gray-200 text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Message"
                  name="message"
                  className="bg-secondary min-h-[120px] rounded-lg border-gray-200 text-gray-500 focus:border-blue-500 focus:ring-blue-500 sm:min-h-[140px] md:min-h-40 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  required
                />
              </div>

              <Button
                type="submit"
                className="bg-secondary hover:bg-accent w-full rounded-lg border border-gray-200 text-gray-600 shadow-sm transition-colors duration-200 hover:text-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                Send
              </Button>
            </div>
          </ActionFormWrapper>
        </div>
      </div>
    </main>
  );
}
