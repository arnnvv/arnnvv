import { Code2 } from "lucide-react";
import type { JSX } from "react";

import type { ProjectWithDetails } from "@/lib/db/types";

export function ProjectCard({
  project,
}: {
  project: ProjectWithDetails;
}): JSX.Element {
  const githubLink = project.links.find((link) => {
    const type = link.link_type.toLowerCase();
    return type.includes("github") || type.includes("source");
  });

  const liveLink = project.links.find((link) => {
    const type = link.link_type.toLowerCase();
    return type.includes("live") || type.includes("demo");
  });

  return (
    <article className="flex flex-col gap-2">
      <header>
        <h2 className="text-foreground text-xl font-bold sm:text-2xl">
          {project.title}
        </h2>
      </header>

      <p className="text-muted-foreground leading-relaxed">
        {project.description}
      </p>

      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Code2 size={16} className="text-muted-foreground" />
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <footer className="flex items-center gap-6 pt-2">
        {githubLink && (
          <a
            href={githubLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 transition-colors hover:underline dark:text-blue-400"
          >
            Code
          </a>
        )}
        {liveLink && (
          <a
            href={liveLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 transition-colors hover:underline dark:text-blue-400"
          >
            Live Link
          </a>
        )}
      </footer>
    </article>
  );
}
