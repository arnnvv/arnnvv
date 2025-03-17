import type { JSX } from "react";

export default function Home(): JSX.Element {
  const links = [
    { name: "@arnnnvvv", url: "https://x.com/arnnnvvv" },
    { name: "github", url: "https://github.com/arnnvv" },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/arnav-sharma-142716261/",
    },
  ];
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-xl p-8 text-center">
          <p className="text-lg font-bold mb-4 text-gray-600">
            Hey there, I'm Arnav
          </p>
          <p className="text-lg mb-4 text-gray-600">
            Currently navigating my undergrad at IIT Roorkee, I spend most of my
            time building, breaking, and rebuilding things—sometimes for fun,
            sometimes because curiosity gets the better of me.
          </p>
          <p className="text-lg mb-4 text-gray-600">
            Code is just the tool; the real obsession lies in figuring out how
            things work (or how they can work better).
          </p>
          <p className="text-lg text-gray-600">
            Whether it's designing scalable systems, launching new ideas, or
            pushing the limits of what's possible, there's always something in
            the pipeline.
          </p>
        </div>
      </main>
      <footer className="bg-gray-100 py-4 px-4 border-t border-gray-200">
        <div className="container mx-auto flex flex-row justify-between items-center">
          <div className="text-sm text-gray-400">© 2025</div>
          <div className="flex space-x-4 tracking-tight">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
