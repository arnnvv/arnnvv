import type { Metadata } from "next";
import type { JSX } from "react";
import { getBlogCount, getBlogSummaries } from "@/app/actions/blog-actions";
import { Pagination } from "@/components/Pagination";
import { BLOGS_PER_PAGE } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { BlogSummary } from "@/lib/db/types";
import { wrapWordsWithTransition } from "@/lib/transitions";
import { TransitionLink } from "@/lib/view-transition";

export const metadata: Metadata = {
  title: "My Writings | Arnav Sharma",
  description:
    "A collection of thoughts, stories, and articles on systems, software, and learning.",
  alternates: {
    canonical: `https://www.arnnvv.sbs/blogs`,
  },
  openGraph: {
    title: "My Writings | Arnav Sharma",
    description:
      "A collection of thoughts, stories, and articles on systems, software, and learning.",
    url: "https://www.arnnvv.sbs/blogs",
    type: "website",
  },
  twitter: {
    title: "My Writings | Arnav Sharma",
    description:
      "A collection of thoughts, stories, and articles on systems, software, and learning.",
  },
};

async function BlogList({
  blogs,
}: {
  blogs: BlogSummary[];
}): Promise<JSX.Element> {
  if (blogs.length === 0) {
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No posts yet
        </h3>
        <p className="text-muted-foreground">
          Stay tuned for upcoming articles and insights!
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
          className="block group"
        >
          <article style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <div className="relative inline-block">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                  {wrapWordsWithTransition(
                    blog.title,
                    `blog-title-${blog.slug}`,
                  )}
                </h2>
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
              <time
                dateTime={blog.created_at.toISOString()}
                className="text-sm text-muted-foreground shrink-0"
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

export default async function BlogsPage(): Promise<JSX.Element> {
  const currentPage = 1;
  const [blogs, totalBlogs] = await Promise.all([
    getBlogSummaries(currentPage),
    getBlogCount(),
  ]);

  const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);

  return (
    <>
      <BlogList blogs={blogs} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/blogs/page"
      />
    </>
  );
}
