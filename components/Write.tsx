import { getCurrentSession, writeBlog } from "@/app/actions";
import type { JSX } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ContactFormWrapper } from "./MailWrapper";

export async function Write(): Promise<JSX.Element> {
  const { user } = await getCurrentSession();

  if (user?.email !== process.env.EMAILTO) {
    return (
      <main className="flex-grow container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Not Authorized to write blog posts.</p>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-zinc-50">
        Write New Blog Post
      </h1>
      <div className="max-w-2xl mx-auto">
        {" "}
        <ContactFormWrapper action={writeBlog}>
          <div className="space-y-4 sm:space-y-5 md:space-y-6 relative">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Title
              </label>
              <Input
                id="title"
                type="text"
                name="title"
                placeholder="Enter your blog title"
                className="border-gray-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-800 dark:text-zinc-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
              >
                Content
              </label>
              <Textarea
                id="description"
                placeholder="Write your blog post content here... (Markdown supported)"
                name="description"
                className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] border-gray-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-800 dark:text-zinc-200"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold transition-colors duration-200 rounded-lg shadow-sm disabled:opacity-50"
            >
              Create Blog Post
            </Button>
          </div>
        </ContactFormWrapper>
      </div>
    </main>
  );
}
