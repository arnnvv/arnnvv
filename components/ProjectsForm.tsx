"use client";

import { PlusCircle, Trash2 } from "lucide-react";
import { type JSX, useId, useRef, useState } from "react";
import { addProjectAction } from "@/app/actions/project-actions";
import { ActionFormWrapper } from "@/components/ActionFormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DynamicLinkInput {
  id: string;
  link_type: string;
  url: string;
}

export function ProjectForm(): JSX.Element {
  const formRef = useRef<HTMLFormElement>(null);
  const [dynamicLinks, setDynamicLinks] = useState<DynamicLinkInput[]>([
    { id: crypto.randomUUID(), link_type: "", url: "" },
  ]);

  const id = useId();

  const handleAddLink = () => {
    setDynamicLinks([
      ...dynamicLinks,
      { id: crypto.randomUUID(), link_type: "", url: "" },
    ]);
  };

  const handleRemoveLink = (id: string) => {
    setDynamicLinks(dynamicLinks.filter((link) => link.id !== id));
  };

  const handleLinkChange = (
    id: string,
    field: keyof Omit<DynamicLinkInput, "id">,
    value: string,
  ) => {
    setDynamicLinks(
      dynamicLinks.map((link) =>
        link.id === id ? { ...link, [field]: value } : link,
      ),
    );
  };

  const prepareFormData = (originalFormData: FormData) => {
    const linksForSubmission = dynamicLinks
      .filter((link) => link.link_type.trim() && link.url.trim())
      .map(({ ...rest }) => rest);
    originalFormData.set("links", JSON.stringify(linksForSubmission));
    return originalFormData;
  };

  return (
    <ActionFormWrapper
      formRef={formRef}
      action={(formData) => addProjectAction(prepareFormData(formData))}
      onSuccess={(_, form) => {
        form.reset();
        setDynamicLinks([{ id: crypto.randomUUID(), link_type: "", url: "" }]);
      }}
      className="space-y-6"
    >
      <div>
        <label
          htmlFor={`title-${id}`}
          className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1"
        >
          Project Title
        </label>
        <Input
          id={`title-${id}`}
          name="title"
          type="text"
          required
          className="dark:bg-zinc-800 dark:border-zinc-700"
        />
      </div>

      <div>
        <label
          htmlFor={`description-${id}`}
          className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1"
        >
          Description
        </label>
        <Textarea
          id={`description-${id}`}
          name="description"
          rows={5}
          required
          className="dark:bg-zinc-800 dark:border-zinc-700"
        />
      </div>

      <div>
        <label
          htmlFor={`tech-${id}`}
          className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1"
        >
          Technologies (comma-separated, e.g., Next.js, TypeScript, PostgreSQL)
        </label>
        <Input
          id={`tech-${id}`}
          name="technologies"
          type="text"
          className="dark:bg-zinc-800 dark:border-zinc-700"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
          Project Links
        </h3>
        {dynamicLinks.map((link) => (
          <div key={link.id} className="flex items-center gap-2 mb-2">
            <Input
              type="text"
              placeholder="Link Type (e.g., GitHub, Live Demo)"
              value={link.link_type}
              onChange={(e) =>
                handleLinkChange(link.id, "link_type", e.target.value)
              }
              className="flex-1 dark:bg-zinc-800 dark:border-zinc-700"
            />
            <Input
              type="url"
              placeholder="Link URL"
              value={link.url}
              onChange={(e) => handleLinkChange(link.id, "url", e.target.value)}
              className="flex-1 dark:bg-zinc-800 dark:border-zinc-700"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveLink(link.id)}
              className="text-red-500 hover:text-red-600 p-1"
              aria-label="Remove link"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLink}
          className="mt-1 flex items-center gap-1 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <PlusCircle size={16} /> Add Link
        </Button>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        Add Project
      </Button>
    </ActionFormWrapper>
  );
}
