import type { Metadata } from "next";
import { type JSX, Suspense } from "react";

import { getProjectsAction } from "@/app/actions/project-actions";
import { TransitionTitle } from "@/components/layout/TransitionTitle";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "My Work | Arnav Sharma",
  description:
    "A showcase of projects I've built, exploring systems, software, and robust design.",
  alternates: {
    canonical: `https://www.arnnvv.sbs/work`,
  },
  openGraph: {
    title: "My Work | Arnav Sharma",
    description:
      "A showcase of projects I've built, exploring systems, software, and robust design.",
    url: "https://www.arnnvv.sbs/work",
  },
  twitter: {
    title: "My Work | Arnav Sharma",
    description:
      "A showcase of projects I've built, exploring systems, software, and robust design.",
  },
};

function ProjectsGridSkeleton(): JSX.Element {
  const skeletonItems = Array.from(
    { length: 4 },
    (_, i) => `project-skeleton-${i}`,
  );

  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-12">
      {skeletonItems.map((id, index) => (
        <div
          key={id}
          className="space-y-4"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="bg-muted h-7 w-1/2 rounded-lg" />
          <div className="bg-muted h-4 w-full rounded" />
          <div className="bg-muted h-4 w-5/6 rounded" />
          <div className="flex flex-wrap gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted h-6 w-20 rounded-full" />
            ))}
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
      <div className="py-16 text-center">
        <div className="bg-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <svg
            className="text-muted-foreground h-12 w-12"
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
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          No projects yet
        </h3>
        <p className="text-muted-foreground">
          Stay tuned for upcoming projects and innovations!
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12">
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
    <main className="relative grow overflow-hidden">
      <div className="from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 absolute inset-0 bg-linear-to-br via-transparent" />
      <div className="bg-primary/10 animate-float absolute top-20 left-10 h-20 w-20 rounded-full blur-xl" />
      <div
        className="bg-accent/10 animate-float absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="bg-primary/5 animate-float absolute top-1/2 left-1/4 h-16 w-16 rounded-full blur-lg"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16 sm:pb-24">
        <header className="mb-16 text-center">
          <TransitionTitle
            title="My Work"
            transitionName="page-title-work"
            className="text-4xl leading-tight font-bold sm:text-5xl"
          />
        </header>
        <Suspense fallback={<ProjectsGridSkeleton />}>
          <ProjectsGrid />
        </Suspense>
      </div>
    </main>
  );
}
