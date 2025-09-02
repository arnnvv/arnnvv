import type { JSX } from "react";
import { getCurrentSession } from "@/app/actions";
import { isUserAdmin } from "@/lib/auth";
import { BlogForm } from "./BlogForm";
import { ProjectForm } from "./ProjectsForm";

export async function Write(): Promise<JSX.Element | string> {
  const { user } = await getCurrentSession();

  if (!isUserAdmin(user)) {
    return "Not Authorized";
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-zinc-50">
          Write New Blog Post
        </h1>
        <BlogForm />
      </div>
      <div className="max-w-2xl mx-auto bg-card p-6 sm:p-8 rounded-lg shadow-md border border-border">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-zinc-50">
          Add New Project
        </h1>
        <ProjectForm />
      </div>
    </main>
  );
}
