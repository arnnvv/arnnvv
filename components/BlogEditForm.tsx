"use client";

import { type JSX, useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { editBlog, getBlogForEditing } from "@/app/actions/blog-actions";
import type { BlogPost } from "@/lib/db/types";

import { ActionFormWrapper } from "./ActionFormWrapper";
import { Spinner } from "./Spinner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

type BlogSummaryForEditing = { id: number; title: string };

export function BlogEditForm({
  allBlogs,
}: {
  allBlogs: BlogSummaryForEditing[];
}): JSX.Element {
  const [selectedBlogId, setSelectedBlogId] = useState<string>("");
  const [blogToEdit, setBlogToEdit] = useState<BlogPost | null>(null);
  const [isFetching, startFetching] = useTransition();
  const [formKey, setFormKey] = useState(() => Date.now());
  const id = useId();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const blogId = e.target.value;
    setSelectedBlogId(blogId);

    if (!blogId) {
      setBlogToEdit(null);
      return;
    }

    startFetching(async () => {
      const blogData = await getBlogForEditing(Number(blogId));
      setBlogToEdit(blogData);
      setFormKey(Date.now());
      if (!blogData) {
        toast.error("Could not fetch blog content.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor={`blog-select-${id}`}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-zinc-300"
        >
          Select Blog to Edit
        </label>
        <select
          id={`blog-select-${id}`}
          onChange={handleSelectChange}
          value={selectedBlogId}
          className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring block w-full rounded-md px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFetching}
        >
          <option value="">-- Select a blog --</option>
          {allBlogs.map((blog) => (
            <option key={blog.id} value={blog.id}>
              {blog.title}
            </option>
          ))}
        </select>
      </div>

      <div className="relative min-h-136">
        {isFetching && <Spinner />}

        {blogToEdit && !isFetching && (
          <ActionFormWrapper
            key={formKey}
            action={editBlog}
            onSuccess={() => {
              setSelectedBlogId("");
              setBlogToEdit(null);
            }}
          >
            <input type="hidden" name="blogId" value={blogToEdit.id} />
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor={`edit-title-${id}`}
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  Title
                </label>
                <Input
                  id={`edit-title-${id}`}
                  type="text"
                  name="title"
                  defaultValue={blogToEdit.title}
                  className="rounded-lg border-gray-300 bg-white/80 text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`edit-description-${id}`}
                  className="block text-sm font-medium text-gray-700 dark:text-zinc-300"
                >
                  Content
                </label>
                <Textarea
                  id={`edit-description-${id}`}
                  name="description"
                  defaultValue={blogToEdit.description}
                  className="min-h-[200px] rounded-lg border-gray-300 bg-white/80 text-gray-800 focus:border-blue-500 focus:ring-blue-500 sm:min-h-[250px] md:min-h-[300px] dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg bg-blue-600 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Update Blog Post
              </Button>
            </div>
          </ActionFormWrapper>
        )}
      </div>
    </div>
  );
}
