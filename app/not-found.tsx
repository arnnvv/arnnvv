import type { JSX } from "react";

export default function NotFound(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-4">
      <div className="w-full max-w-md text-center">
        <div className="relative mb-10">
          <h1 className="text-9xl font-bold tracking-tighter">404</h1>
          <div className="absolute -bottom-4 left-0 right-0 h-px bg-black" />
        </div>

        <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-gray-700 mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="mb-10">
          <svg
            className="w-16 h-16 mx-auto"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title id="notFoundIconTitle">Page Not Found Icon</title>
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.2422 7.75781L7.75781 16.2422"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.75781 7.75781L16.2422 16.2422"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <a
          href="/"
          className="inline-block px-6 py-3 text-sm font-medium bg-black text-white border border-black rounded-md hover:bg-white hover:text-black transition-colors"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
