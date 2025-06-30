import type { ReactNode } from "react";

const isSafeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const linkifyText = (text: string): ReactNode => {
  const urlRegex = /(https?:\/\/[^\s/$.?#].[^\s]*)/gi;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        const key = `${part}-${index}`;
        if (index % 2 === 1 && isSafeUrl(part)) {
          return (
            <a
              key={`link-${key}`}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {part}
            </a>
          );
        }
        return <span key={`text-${key}`}>{part}</span>;
      })}
    </>
  );
};
