import type { Metadata } from "next";
import { type JSX, Suspense } from "react";
import { ContactFormContent, ContactFormSkeleton } from "@/components/Contact";

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
    <main className="flex-grow relative overflow-hidden flex items-center py-6 sm:py-8 md:py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 w-full">
        <Suspense fallback={<ContactFormSkeleton />}>
          <ContactFormContent />
        </Suspense>
      </div>
    </main>
  );
}
