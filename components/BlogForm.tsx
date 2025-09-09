"use client";

import { type JSX, useId } from "react";
import { writeBlog } from "@/app/actions/blog-actions";
import { ActionFormWrapper } from "./ActionFormWrapper";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function BlogForm(): JSX.Element {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <ActionFormWrapper action={writeBlog}>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="space-y-2">
          <label
            htmlFor={titleId}
            className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
          >
            Title
          </label>
          <Input
            id={titleId}
            type="text"
            name="title"
            placeholder="Enter your blog title"
            className="border-gray-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-800 dark:text-zinc-200"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={descriptionId}
            className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
          >
            Content
          </label>
          <Textarea
            id={descriptionId}
            placeholder="Write your blog post content here... (Markdown supported)"
            name="description"
            className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] border-gray-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-800 dark:text-zinc-200"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold transition-colors duration-200 rounded-lg shadow-sm"
        >
          Create Blog Post
        </Button>
      </div>
    </ActionFormWrapper>
  );
}
