"use client";

import { type JSX, useId } from "react";

import { writeBlog } from "@/app/actions/blog-actions";

import { ActionFormWrapper } from "./ActionFormWrapper";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function BlogForm(): JSX.Element {
  const id = useId();

  return (
    <ActionFormWrapper action={writeBlog}>
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        <div className="space-y-2">
          <label
            htmlFor={`title-${id}`}
            className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
          >
            Title
          </label>
          <Input
            id={`title-${id}`}
            type="text"
            name="title"
            placeholder="Enter your blog title"
            className="rounded-lg border-gray-300 bg-white/80 text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            required
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor={`description-${id}`}
            className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
          >
            Content
          </label>
          <Textarea
            id={`description-${id}`}
            placeholder="Write your blog post content here... (Markdown supported)"
            name="description"
            className="min-h-[200px] rounded-lg border-gray-300 bg-white/80 text-gray-800 focus:border-blue-500 focus:ring-blue-500 sm:min-h-[250px] md:min-h-[300px] dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full rounded-lg bg-blue-600 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Create Blog Post
        </Button>
      </div>
    </ActionFormWrapper>
  );
}
