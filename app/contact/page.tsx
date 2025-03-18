import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { JSX } from "react";

export default function ContactForm(): JSX.Element {
  return (
    <main className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <form className="space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Your Email"
              className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-gray-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Subject"
              className="border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-gray-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Message"
              className="min-h-[120px] border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-500 dark:text-gray-300"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200 rounded-lg shadow-sm"
          >
            Send
          </Button>
        </form>
      </div>
    </main>
  );
}
