import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import type { JSX } from "react";
import { getBlogCount, getBlogSummaries } from "@/app/actions/blog-actions";
import { TransitionTitle } from "@/components/layout/TransitionTitle";
import { Pagination } from "@/components/Pagination";
import { BLOGS_PER_PAGE } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { BlogSummary } from "@/lib/db/types";
import { wrapWordsWithTransition } from "@/lib/transitions";
import { TransitionLink } from "@/lib/view-transition";

interface PaginatedBlogsPageProps {
  params: Promise<{ page: string }>;
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
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-foreground mb-2">
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
          className="block"
        >
          <article
            className="group relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 pr-4">
                {wrapWordsWithTransition(blog.title, `blog-title-${blog.slug}`)}
              </h2>
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <time dateTime={blog.created_at.toISOString()}>
                {formatDate(blog.created_at)}
              </time>
              <span className="mx-2">•</span>
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
    <main className="grow relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
      <div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <TransitionTitle
              title="My Writings"
              transitionName="page-title-writings"
              className="text-4xl sm:text-5xl font-bold leading-tight"
            />
          </header>
          <BlogList blogs={blogs} />
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            basePath="/blogs/page"
          />
        </div>
      </div>
    </main>
  );
}
