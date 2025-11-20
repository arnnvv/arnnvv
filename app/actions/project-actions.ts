"use server";

import { DatabaseError } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";

import { isUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult, ProjectWithDetails } from "@/lib/db/types";
import { globalPOSTRateLimit } from "@/lib/request";

import { getCurrentSession } from "./auth-actions";

export async function addProjectAction(
  formData: FormData,
): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      success: false,
      message: "Rate limit exceeded.",
    };
  }

  const { user } = await getCurrentSession();
  if (!isUserAdmin(user)) {
    return {
      success: false,
      message: "Not authorized to add projects.",
    };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologiesString = formData.get("technologies") as string;
  const linksJsonString = formData.get("links") as string;

  if (!title || title.trim().length === 0) {
    return {
      success: false,
      message: "Project title is required.",
    };
  }
  if (!description || description.trim().length === 0) {
    return {
      success: false,
      message: "Project description is required.",
    };
  }

  const technologiesArray = technologiesString
    ? technologiesString
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0)
    : [];

  let parsedLinks: Array<{ link_type: string; url: string }>;
  try {
    parsedLinks = linksJsonString ? JSON.parse(linksJsonString) : [];
    if (
      !Array.isArray(parsedLinks) ||
      !parsedLinks.every(
        (link) =>
          typeof link === "object" &&
          link !== null &&
          typeof link.link_type === "string" &&
          link.link_type.trim() !== "" &&
          typeof link.url === "string" &&
          link.url.trim() !== "",
      )
    ) {
      throw new Error("Invalid links format.");
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message:
        "Invalid format for project links. Each link must have a non-empty 'link_type' and 'url'.",
    };
  }

  try {
    const results = await db.transaction([
      db`INSERT INTO arnnvv_projects (title, description)
          VALUES (${title.trim()}, ${description.trim()})
          RETURNING id`,

      ...(technologiesArray.length > 0
        ? [
            db`INSERT INTO arnnvv_project_technologies (project_id, technology)
               SELECT (SELECT id FROM arnnvv_projects WHERE title = ${title.trim()} LIMIT 1), unnest(${technologiesArray}::text[])`,
          ]
        : []),

      ...(parsedLinks.length > 0
        ? [
            db`INSERT INTO arnnvv_project_links (project_id, link_type, url)
               SELECT
                 (SELECT id FROM arnnvv_projects WHERE title = ${title.trim()} LIMIT 1),
                 link_type,
                 url
               FROM jsonb_to_recordset(${JSON.stringify(parsedLinks)}::jsonb)
               AS x(link_type text, url text)`,
          ]
        : []),
    ]);

    const firstResult = results[0];
    if (!firstResult || firstResult.length === 0) {
      throw new Error("Failed to insert project - no result returned.");
    }

    const projectId = firstResult[0]?.["id"];
    if (!projectId) {
      throw new Error("Failed to insert project - no ID returned.");
    }

    revalidatePath("/work");
    return { success: true, message: "Project added successfully!" };
  } catch (e) {
    console.error(`Error adding project: ${e}`);

    if (e instanceof DatabaseError && e.code === "23505") {
      return {
        success: false,
        message: "A project with this title already exists.",
      };
    }

    return {
      success: false,
      message: "Error adding project. Please try again.",
    };
  }
}

export async function getProjectsAction(): Promise<ProjectWithDetails[]> {
  "use cache";
  try {
    const results = await db`
      WITH project_techs AS (
        SELECT
          project_id,
          ARRAY_AGG(technology ORDER BY technology) as technologies
        FROM arnnvv_project_technologies
        GROUP BY project_id
      ), project_links_agg AS (
        SELECT
          project_id,
          JSONB_AGG(JSONB_BUILD_OBJECT('link_type', link_type, 'url', url) ORDER BY id) as links_json
        FROM arnnvv_project_links
        GROUP BY project_id
      )
      SELECT
        p.id,
        p.title,
        p.description,
        COALESCE(pt.technologies, '{}'::text[]) as technologies,
        COALESCE(pl.links_json, '[]'::jsonb) as links
      FROM arnnvv_projects p
      LEFT JOIN project_techs pt ON p.id = pt.project_id
      LEFT JOIN project_links_agg pl ON p.id = pl.project_id
    `;

    return results as ProjectWithDetails[];
  } catch (e) {
    console.error(`Error fetching projects with details: ${e}`);
    return [];
  }
}
