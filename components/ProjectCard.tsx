import { Code2, ExternalLink } from "lucide-react";
import type { JSX } from "react";
import type { ProjectWithDetails } from "@/lib/db/types";

export function ProjectCard({
  project,
}: {
  project: ProjectWithDetails;
}): JSX.Element {
  return (
    <article className="p-5 sm:p-6 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out flex flex-col h-full">
      <header className="mb-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-zinc-100">
          {project.title}
        </h2>
      </header>

      <div className="text-sm text-gray-700 dark:text-zinc-300 mb-4 grow">
        <p className="whitespace-pre-wrap">{project.description}</p>
      </div>

      {project.technologies && project.technologies.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Code2 size={14} /> Built With
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-xs text-gray-700 dark:text-zinc-300 rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.links && project.links.length > 0 && (
        <footer className="mt-auto pt-3 border-t border-gray-200 dark:border-zinc-700">
          <h3 className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Links
          </h3>
          <ul className="space-y-1">
            {project.links.map((link) => (
              <li key={link.link_type + link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 hover:underline transition-colors"
                >
                  {link.link_type}
                  <ExternalLink size={14} className="opacity-75" />
                </a>
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
