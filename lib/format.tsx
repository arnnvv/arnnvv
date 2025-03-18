import type { JSX, ReactNode } from "react";

type ListType = "ul" | "ol" | null;

export const formatContent = (content: string): JSX.Element[] => {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let currentListItems: JSX.Element[] = [];
  let currentListType: ListType = null;
  let listKey = 0;
  let orderedListCounter = 1;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let currentParagraph: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      const ListTag = currentListType === "ol" ? "ol" : "ul";
      elements.push(
        <ListTag
          key={`${ListTag}-${listKey++}`}
          className={`${
            ListTag === "ul" ? "list-disc" : "list-decimal"
          } list-inside mb-4 pl-4`}
          {...(ListTag === "ol"
            ? { start: orderedListCounter - currentListItems.length }
            : {})}
        >
          {currentListItems}
        </ListTag>,
      );
      currentListItems = [];
      currentListType = null;
      orderedListCounter = 1;
    }
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-4 leading-relaxed">
          {parseInline(currentParagraph.join(" "))}
        </p>,
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
        </pre>,
      );
      codeBlockContent = [];
    }
  };

  const isTableRow = (line: string): boolean => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("|") &&
      trimmed.endsWith("|") &&
      trimmed.split("|").length > 2
    );
  };

  const isTableSeparator = (line: string): boolean => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith("|") &&
      trimmed.endsWith("|") &&
      trimmed.includes("-") &&
      trimmed.split("|").filter((cell) => cell.trim().match(/^-+$/)).length > 0
    );
  };

  const parseTableRow = (line: string): string[] => {
    return line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
  };

  const renderTable = (
    tableData: string[],
    key: number,
  ): JSX.Element | null => {
    if (tableData.length < 3) return null;

    const headers = parseTableRow(tableData[0]);

    const rows: string[][] = [];
    for (let i = 2; i < tableData.length; i++) {
      if (
        isTableSeparator(tableData[i]) ||
        tableData[i].trim().replace(/\|/g, "").trim() === ""
      ) {
        continue;
      }
      const row = parseTableRow(tableData[i]);
      if (row.length === headers.length) {
        rows.push(row);
      }
    }

    if (headers.length === 0 || rows.length === 0) return null;

    return (
      <table
        key={`table-${key}`}
        className="w-full border-collapse border border-gray-200 mb-4"
      >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-gray-300 p-2 font-semibold text-left"
              >
                {parseInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 p-2">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  let lineIndex = 0;
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
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
      lineIndex++;
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(originalLine);
      lineIndex++;
      continue;
    }

    if (isTableRow(originalLine)) {
      if (
        !inTable &&
        lineIndex + 1 < lines.length &&
        isTableSeparator(lines[lineIndex + 1])
      ) {
        inTable = true;
        tableLines = [];
        flushList();
        flushParagraph();
      }

      if (inTable) {
        tableLines.push(originalLine);
        lineIndex++;
        continue;
      }
    } else if (inTable) {
      const tableElement = renderTable(tableLines, listKey++);
      if (tableElement) {
        elements.push(tableElement);
      }
      inTable = false;
      tableLines = [];
    }

    const headerMatch = trimmedLine.match(/^(#+)\s(.*)/);
    if (headerMatch) {
      flushList();
      flushParagraph();
      const level = Math.min(headerMatch[1].length, 6);
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const sizes = [
        "text-3xl",
        "text-2xl",
        "text-xl",
        "text-lg",
        "text-base",
        "text-sm",
      ];
      elements.push(
        <Tag
          key={`h-${elements.length}`}
          className={`${sizes[level - 1]} font-bold mt-6 mb-4`}
        >
          {parseInline(headerMatch[2])}
        </Tag>,
      );
      lineIndex++;
      continue;
    }

    const listMatch = originalLine.match(/^(\s*)(\*|\-|\d+\.)\s(.*)/);
    if (listMatch) {
      flushParagraph();
      const type = listMatch[2].match(/\d+/) ? "ol" : "ul";

      if (type !== currentListType) {
        flushList();
        currentListType = type;
        if (type === "ol") {
          const numberMatch = listMatch[2].match(/(\d+)\./);
          if (numberMatch && numberMatch[1]) {
            orderedListCounter = parseInt(numberMatch[1], 10);
          } else {
            orderedListCounter = 1;
          }
        }
      }

      currentListItems.push(
        <li key={`li-${currentListItems.length}`} className="mb-2">
          {parseInline(listMatch[3])}
        </li>,
      );

      if (type === "ol") {
        orderedListCounter++;
      }

      lineIndex++;
      continue;
    }

    if (/^(---|\*\*\*)$/.test(trimmedLine)) {
      flushList();
      flushParagraph();
      elements.push(
        <hr
          key={`hr-${elements.length}`}
          className="my-6 border-t-2 border-gray-200"
        />,
      );
      lineIndex++;
      continue;
    }

    if (trimmedLine === "") {
      flushList();
      flushParagraph();
      elements.push(<br key={`br-${elements.length}`} />);
    } else {
      if (!isTableRow(originalLine)) {
        currentParagraph.push(originalLine);
      }
    }

    lineIndex++;
  }

  if (inTable) {
    const tableElement = renderTable(tableLines, listKey++);
    if (tableElement) {
      elements.push(tableElement);
    }
  }
  flushCodeBlock();
  flushList();
  flushParagraph();

  return elements;
};

const parseInline = (text: string): ReactNode[] => {
  const elements: ReactNode[] = [];
  const regex =
    /(\*\*.*?\*\*|_.*?_|\*.*?\*|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  parts.forEach((part, index) => {
    if (!part) return;

    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      elements.push(
        <strong key={`bold-${index}`} className="font-semibold">
          {content}
        </strong>,
      );
    } else if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      const content = part.slice(1, -1);
      elements.push(
        <em key={`italic-${index}`} className="italic">
          {content}
        </em>,
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      const content = part.slice(1, -1);
      elements.push(
        <code
          key={`code-${index}`}
          className="font-mono bg-gray-100 px-1 py-0.5 rounded"
        >
          {content}
        </code>,
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
          />,
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
          </a>,
        );
      }
    } else {
      elements.push(part);
    }
  });

  return elements;
};
