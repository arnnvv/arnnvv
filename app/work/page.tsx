import { type JSX, Suspense } from "react";
import { getProjectsAction } from "@/app/actions";
import { ProjectCard } from "@/components/ProjectCard";
import { TransitionTitle } from "@/components/layout/TransitionTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Work",
  description: "An artist's gallery lol",
};

function ProjectsGridSkeleton(): JSX.Element {
  const skeletonItems = Array.from(
    { length: 6 },
    (_, i) => `project-skeleton-${i}`,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
      {skeletonItems.map((id, index) => (
        <div
          key={id}
          className="p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="h-8 bg-muted rounded-lg w-3/4 mb-4" />
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-muted rounded-full w-16" />
            ))}
          </div>
          <div className="flex gap-3">
            <div className="h-8 bg-muted rounded w-20" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function ProjectsGrid(): Promise<JSX.Element> {
  const projects = await getProjectsAction();

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No projects yet
        </h3>
        <p className="text-muted-foreground">
          Stay tuned for upcoming projects and innovations!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}

export default function WorkPage(): JSX.Element {
  return (
    <main className="flex-grow relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <header className="text-center mb-16">
          <TransitionTitle
            title="My Work"
            transitionName="page-title-work"
            className="text-4xl sm:text-5xl font-bold leading-tight"
          />
        </header>
        <Suspense fallback={<ProjectsGridSkeleton />}>
          <ProjectsGrid />
        </Suspense>
      </div>
    </main>
  );
}
