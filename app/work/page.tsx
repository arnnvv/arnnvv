import { type JSX, Suspense } from "react";
import { getProjectsAction } from "@/app/actions";
import { ProjectCard } from "@/components/ProjectCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Work",
  description: "A showcase of projects built by me.",
};

function ProjectsGridSkeleton(): JSX.Element {
  const skeletonItems = Array.from(
    { length: 3 },
    (_, i) => `project-skeleton-${i}`,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {skeletonItems.map((id) => (
        <div
          key={id}
          className="p-6 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm space-y-4"
        >
          <div className="h-6 bg-gray-300 dark:bg-zinc-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-full" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-5/6" />
          <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-1/2 mt-2" />
          <div className="flex gap-2 mt-3">
            <div className="h-5 w-16 bg-gray-300 dark:bg-zinc-600 rounded-full" />
            <div className="h-5 w-20 bg-gray-300 dark:bg-zinc-600 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProjectsList(): Promise<JSX.Element> {
  const projects = await getProjectsAction();

  if (projects.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-zinc-400 col-span-full">
        No projects to display yet. Check back soon!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default function WorkPage(): JSX.Element {
  return (
    <main className="flex-grow container mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-zinc-50">
        My Work
      </h1>

      <p className="text-sm sm:text-base text-center text-gray-600 dark:text-zinc-400 mb-8">
        For reference, the best place to look is my{" "}
        <a
          href="https://github.com/arnnvv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-gray-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
        >
          GitHub
        </a>
        .
      </p>

      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsList />
      </Suspense>
    </main>
  );
}
