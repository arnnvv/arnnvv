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
    <main className="grow relative overflow-hidden flex items-center py-6 sm:py-8 md:py-12 px-4">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 w-full">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <ActionFormWrapper action={sendEmailAtn}>
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="border-gray-200 dark:border-zinc-800 bg-secondary dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Message"
                  name="message"
                  className="min-h-[120px] sm:min-h-[140px] md:min-h-40 border-gray-200 dark:border-zinc-800 bg-secondary dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-zinc-200"
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
          </ActionFormWrapper>
        </div>
      </div>
    </main>
  );
}
