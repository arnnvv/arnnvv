import type { JSX, ReactNode } from "react";

type ListType = "ul" | "ol" | null;

export const formatContent = (content: string): JSX.Element[] => {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let currentListItems: JSX.Element[] = [];
  let currentListType: ListType = null;
  let listKey = 0;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let currentParagraph: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      const ListTag = currentListType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key={`${ListTag}-${listKey++}`}
          className={`${
            ListTag === "ul" ? "list-disc" : "list-decimal"
          } list-inside mb-4 pl-4`}
        >
          {currentListItems}
        </ListTag>
      );
      currentListItems = [];
      currentListType = null;
    }
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
          {parseInline(currentParagraph.join(" "))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      elements.push(
        <pre
          key={`pre-${elements.length}`}
          className="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"
        >
          <code>{codeBlockContent.join("\n")}</code>
        </pre>
      );
      codeBlockContent = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const originalLine = line;

    if (trimmedLine.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        flushParagraph();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(originalLine);
      return;
    }

    const headerMatch = trimmedLine.match(/^(#+)\s(.*)/);
    if (headerMatch) {
      flushList();
      flushParagraph();
      const level = Math.min(headerMatch[1].length, 6);
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const sizes = ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base", "text-sm"];
      elements.push(
        <Tag
          key={`h-${index}`}
          className={`${sizes[level - 1]} font-bold mt-6 mb-4`}
        >
          {parseInline(headerMatch[2])}
        </Tag>
      );
      return;
    }

    const listMatch = originalLine.match(/^(\*|\-|\d+\.)\s(.*)/);
    if (listMatch) {
      flushParagraph();
      const type = listMatch[1].match(/\d+/) ? "ol" : "ul";
      
      if (type !== currentListType) {
        flushList();
        currentListType = type;
      }

      currentListItems.push(
        <li key={`li-${index}`} className="mb-2">
          {parseInline(listMatch[2])}
        </li>
      );
      return;
    }

    if (/^(---|\*\*\*)$/.test(trimmedLine)) {
      flushList();
      flushParagraph();
      elements.push(
        <hr key={`hr-${index}`} className="my-6 border-t-2 border-gray-200" />
      );
      return;
    }

    if (trimmedLine === "") {
      flushList();
      flushParagraph();
      elements.push(<br key={`br-${index}`} />);
    } else {
      currentParagraph.push(originalLine);
    }
  });

  flushCodeBlock();
  flushList();
  flushParagraph();

  return elements;
};

const parseInline = (text: string): ReactNode[] => {
  const elements: ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|_.*?_|\*.*?\*|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  parts.forEach((part, index) => {
    if (!part) return;

    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      elements.push(
        <strong key={`bold-${index}`} className="font-semibold">
          {content}
        </strong>
      );
    } else if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      const content = part.slice(1, -1);
      elements.push(
        <em key={`italic-${index}`} className="italic">
          {content}
        </em>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      const content = part.slice(1, -1);
      elements.push(
        <code key={`code-${index}`} className="font-mono bg-gray-100 px-1 py-0.5 rounded">
          {content}
        </code>
      );
    } else if (part.startsWith("![")) {
      const match = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, alt, src] = match;
        elements.push(
          <img
            key={`img-${index}`}
            src={src}
            alt={alt}
            className="my-4 max-w-full h-auto rounded-lg"
          />
        );
      }
    } else if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, text, href] = match;
        elements.push(
          <a
            key={`link-${index}`}
            href={href}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>
        );
      }
    } else {
      elements.push(part);
    }
  });

  return elements;
};
