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
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {project.title}
        </h2>
      </header>

      <p className="text-muted-foreground leading-relaxed">
        {project.description}
      </p>

      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center pt-2">
          <Code2 size={16} className="text-muted-foreground" />
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full"
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
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            Code
          </a>
        )}
        {liveLink && (
          <a
            href={liveLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            Live Link
          </a>
        )}
      </footer>
    </article>
  );
}
