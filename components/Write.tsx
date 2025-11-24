import type { JSX } from "react";

import { getCurrentSession } from "@/app/actions/auth-actions";
import { getAllBlogSummariesForEditing } from "@/app/actions/blog-actions";
import { isUserAdmin } from "@/lib/auth";

import { BlogEditForm } from "./BlogEditForm";
import { BlogForm } from "./BlogForm";
import { ProjectForm } from "./ProjectsForm";

export async function Write(): Promise<JSX.Element | string> {
  const { user } = await getCurrentSession();

  if (!isUserAdmin(user)) {
    return "Not Authorized";
  }

  const allBlogsForEditing = await getAllBlogSummariesForEditing();

  return (
    <main className="container mx-auto grow px-4 py-8">
      <div className="border-border bg-card mx-auto mb-16 max-w-2xl rounded-lg border p-6 shadow-md sm:p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-zinc-50">
          Write New Blog Post
        </h1>
        <BlogForm />
      </div>

      <div className="border-border bg-card mx-auto mb-16 max-w-2xl rounded-lg border p-6 shadow-md sm:p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-zinc-50">
          Edit Blog Post
        </h1>
        <BlogEditForm allBlogs={allBlogsForEditing} />
      </div>

      <div className="border-border bg-card mx-auto max-w-2xl rounded-lg border p-6 shadow-md sm:p-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 sm:text-4xl dark:text-zinc-50">
          Add New Project
        </h1>
        <ProjectForm />
      </div>
    </main>
  );
}
