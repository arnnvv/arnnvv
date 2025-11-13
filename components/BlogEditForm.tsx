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
          className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1"
        >
          Select Blog to Edit
        </label>
        <select
          id={`blog-select-${id}`}
          onChange={handleSelectChange}
          value={selectedBlogId}
          className="block w-full rounded-md border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="border-gray-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-800 dark:text-zinc-200"
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
                  className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] border-gray-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/90 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg text-gray-800 dark:text-zinc-200"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold transition-colors duration-200 rounded-lg shadow-sm"
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
