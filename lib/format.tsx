import type { JSX, ReactNode } from "react";

type ListType = "ul" | "ol" | null;
interface ListContext {
  type: ListType;
  items: JSX.Element[];
  indent: number;
  counter: number;
  start: number;
}

export const formatContent = (content: string): JSX.Element[] => {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  const listStack: ListContext[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = "";
  let currentParagraph: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;
  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  const flushListStack = () => {
    while (listStack.length > 0) {
      const list = listStack.pop();
      if (list && list.items.length > 0) {
        const ListTag = list.type === "ol" ? "ol" : "ul";
        elements.push(
          <ListTag
            key={`${ListTag}-${elements.length}`}
            className={`${
              ListTag === "ul" ? "list-disc" : "list-decimal"
            } list-inside mb-4 pl-4`}
            {...(list.type === "ol" ? { start: list.start } : {})}
          >
            {list.items}
          </ListTag>,
        );
      }
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
          <code
            className={codeBlockLanguage ? `language-${codeBlockLanguage}` : ""}
          >
            {codeBlockContent.join("\n")}
          </code>
        </pre>,
      );
      codeBlockContent = [];
      codeBlockLanguage = "";
    }
  };

  const flushBlockquote = () => {
    if (blockquoteContent.length > 0) {
      elements.push(
        <blockquote
          key={`blockquote-${elements.length}`}
          className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600"
        >
          {blockquoteContent.map((line, idx) => (
            <p key={idx}>{parseInline(line)}</p>
          ))}
        </blockquote>,
      );
      blockquoteContent = [];
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

  const parseTableRow = (line: string): string[] => {
    return line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
  };

  const getColumnAlignment = (cell: string): string => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "text-center";
    if (cell.endsWith(":")) return "text-right";
    if (cell.startsWith(":")) return "text-left";
    return "text-left";
  };

  const renderTable = (
    tableData: string[],
    key: number,
  ): JSX.Element | null => {
    if (tableData.length < 2) return null;

    const headers = parseTableRow(tableData[0]);
    const separator = parseTableRow(tableData[1]);
    const alignments = separator.map(getColumnAlignment);

    const rows: string[][] = [];
    for (let i = 2; i < tableData.length; i++) {
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
                className={`border border-gray-300 p-2 font-semibold ${alignments[index]}`}
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
                <td
                  key={cellIndex}
                  className={`border border-gray-300 p-2 ${alignments[cellIndex]}`}
                >
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
        const languageMatch = trimmedLine.match(/^```(\S*)/);
        codeBlockLanguage = languageMatch ? languageMatch[1] : "";
        flushListStack();
        flushParagraph();
        flushBlockquote();
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

    if (trimmedLine.startsWith("> ")) {
      if (!inBlockquote) {
        flushListStack();
        flushParagraph();
        inBlockquote = true;
      }
      blockquoteContent.push(line.replace(/^> /, "").trim());
      lineIndex++;
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
      inBlockquote = false;
    }

    if (isTableRow(originalLine)) {
      if (!inTable) {
        flushListStack();
        flushParagraph();
        inTable = true;
        tableLines = [];
      }
      tableLines.push(originalLine);
      lineIndex++;
      continue;
    } else if (inTable) {
      const tableElement = renderTable(tableLines, elements.length);
      if (tableElement) elements.push(tableElement);
      inTable = false;
      tableLines = [];
    }

    const headerMatch = trimmedLine.match(/^(#+)\s(.*)/);
    if (headerMatch) {
      flushListStack();
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
      const indent = listMatch[1].length;
      const type = listMatch[2].match(/\d+/) ? "ol" : "ul";
      const listNumber =
        type === "ol" ? Number.parseInt(listMatch[2], 10) || 1 : 0;
      let currentList = listStack[listStack.length - 1];

      while (
        listStack.length > 0 &&
        listStack[listStack.length - 1].indent > indent
      ) {
        listStack.pop();
      }

      if (!currentList || currentList.indent < indent) {
        currentList = {
          type,
          items: [],
          indent,
          counter: listNumber,
          start: listNumber,
        };
        listStack.push(currentList);
      }

      const taskMatch = listMatch[3].match(/^\[( |x)\]\s(.*)/);
      const content = taskMatch ? taskMatch[2] : listMatch[3];
      const checked = taskMatch ? taskMatch[1] === "x" : false;

      currentList.items.push(
        <li key={`li-${currentList.items.length}`} className="mb-2">
          {taskMatch && (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 align-middle"
            />
          )}
          {parseInline(content)}
        </li>,
      );

      if (type === "ol") {
        currentList.counter++;
      }

      lineIndex++;
      continue;
    }

    if (/^(---|\*\*\*)$/.test(trimmedLine)) {
      flushListStack();
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
      flushListStack();
      flushParagraph();
    } else {
      currentParagraph.push(originalLine);
    }

    lineIndex++;
  }

  flushBlockquote();
  flushCodeBlock();
  flushListStack();
  flushParagraph();
  if (inTable) {
    const tableElement = renderTable(tableLines, elements.length);
    if (tableElement) elements.push(tableElement);
  }

  return elements;
};

const parseInline = (text: string): ReactNode[] => {
  const elements: ReactNode[] = [];
  const regex =
    /(\*\*.*?\*\*|_.*?_|\*.*?\*|~~.*?~~|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
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
    } else if (part.startsWith("~~") && part.endsWith("~~")) {
      const content = part.slice(2, -2);
      elements.push(
        <del key={`del-${index}`} className="line-through">
          {content}
        </del>,
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
      const match = part.match(/!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/);
      if (match) {
        const [, alt, src, title] = match;
        elements.push(
          <img
            key={`img-${index}`}
            src={src}
            alt={alt}
            title={title}
            className="my-4 max-w-full h-auto rounded-lg"
          />,
        );
      }
    } else if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/);
      if (match) {
        const [, text, href, title] = match;
        elements.push(
          <a
            key={`link-${index}`}
            href={href}
            className="text-blue-600 hover:underline"
            title={title}
            target="_blank"
            rel="noopener noreferrer"
          >
            {text}
          </a>,
        );
      }
    } else {
      part.split(/( {2}\n|\n)/).forEach((segment, segIndex) => {
        if (segment === "\n" || segment === "  \n") {
          elements.push(<br key={`br-${index}-${segIndex}`} />);
        } else if (segment) {
          elements.push(segment);
        }
      });
    }
  });

  return elements;
};
