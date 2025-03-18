import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { JSX } from "react";

export default function ContactForm(): JSX.Element {
  return (
    <main className="bg-gray-100 min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <form className="space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Your Email"
              className="border-gray-200 bg-white/80 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Subject"
              className="border-gray-200 bg-white/80 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Message"
              className="min-h-[120px] border-gray-200 bg-white/80 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white text-gray-600 hover:text-blue-500 border border-gray-200 hover:border-blue-500 transition-colors duration-200 rounded-lg shadow-sm"
          >
            Send
          </Button>
        </form>
      </div>
    </main>
  );
}
