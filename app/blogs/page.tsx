import type { JSX } from "react";
import Link from "next/link";
import { getBlogSummaries } from "@/app/actions";
import { formatDate } from "@/lib/date";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Writings",
  description: "A collection of thoughts, stories, and articles.",
};

async function BlogList(): Promise<JSX.Element> {
  const blogs = await getBlogSummaries();

  if (blogs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
        <article
          key={blog.id}
          className="group relative p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <Link href={`/blogs/${blog.slug}`} className="block">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1 pr-4">
                {blog.title}
              </h2>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          </Link>
        </article>
      ))}
    </div>
  );
}

export default function BlogsPage(): JSX.Element {
  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Writings
            </h1>
          </header>

          <BlogList />
        </div>
      </div>
    </main>
  );
}
