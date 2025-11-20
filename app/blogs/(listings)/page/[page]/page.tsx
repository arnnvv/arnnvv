import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { JSX } from "react";

import { getBlogCount, getBlogSummaries } from "@/app/actions/blog-actions";
import { Pagination } from "@/components/Pagination";
import { BLOGS_PER_PAGE } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { BlogSummary } from "@/lib/db/types";
import { wrapWordsWithTransition } from "@/lib/transitions";
import { TransitionLink } from "@/lib/view-transition";

interface PaginatedBlogsPageProps {
  params: Promise<{
    page: string;
  }>;
}

export async function generateMetadata({
  params,
}: PaginatedBlogsPageProps): Promise<Metadata> {
  const page = Number.parseInt((await params).page, 10);
  if (Number.isNaN(page) || page < 1) {
    return { title: "Invalid Page" };
  }

  const title = `My Writings - Page ${page} | Arnav Sharma`;
  const description = `Page ${page} of my thoughts, stories, and articles.`;
  const url = `https://www.arnnvv.sbs/blogs/page/${page}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      title,
      description,
    },
  };
}

async function BlogList({
  blogs,
}: {
  blogs: BlogSummary[];
}): Promise<JSX.Element> {
  if (blogs.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          No posts on this page
        </h3>
        <p className="text-muted-foreground">
          Looks like you&apos;ve reached the end.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {blogs.map((blog, index) => (
        <TransitionLink
          key={blog.id}
          href={`/blogs/${blog.slug}`}
          className="group block"
        >
          <article style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <div className="relative inline-block">
                <h2 className="text-foreground group-hover:text-primary text-xl font-bold transition-colors duration-300 sm:text-2xl">
                  {wrapWordsWithTransition(
                    blog.title,
                    `blog-title-${blog.slug}`,
                  )}
                </h2>
                <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 transform transition-transform duration-300 group-hover:scale-x-100" />
              </div>
              <time
                dateTime={blog.created_at.toISOString()}
                className="text-muted-foreground shrink-0 text-sm"
              >
                <span
                  style={{
                    viewTransitionName: `blog-date-${blog.slug}`,
                  }}
                >
                  {formatDate(blog.created_at)}
                </span>
              </time>
            </div>
          </article>
        </TransitionLink>
      ))}
    </div>
  );
}

export default async function PaginatedBlogsPage({
  params,
}: PaginatedBlogsPageProps): Promise<JSX.Element> {
  const { page } = await params;
  const pageNumber = Number.parseInt(page, 10);

  if (Number.isNaN(pageNumber) || pageNumber < 1) {
    notFound();
  }

  if (pageNumber === 1) {
    redirect("/blogs");
  }

  const [blogs, totalBlogs] = await Promise.all([
    getBlogSummaries(pageNumber),
    getBlogCount(),
  ]);

  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);

  if (pageNumber > totalPages && totalPages > 0) {
    notFound();
  }

  return (
    <>
      <BlogList blogs={blogs} />
      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        basePath="/blogs/page"
      />
    </>
  );
}
