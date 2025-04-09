import { Suspense, type JSX } from "react";
import { globalGETRateLimit } from "@/lib/request";
import { ContactFormContent, ContactFormSkeleton } from "@/components/Contact";

export default async function ContactForm(): Promise<JSX.Element> {
  if (!(await globalGETRateLimit())) {
    return <>TOO MANY REQs</>;
  }

  return (
    <main className="bg-gray-100 dark:bg-zinc-950 flex-grow flex items-center py-6 sm:py-8 md:py-12 px-4">
      <Suspense fallback={<ContactFormSkeleton />}>
        <ContactFormContent />
      </Suspense>
    </main>
  );
}
