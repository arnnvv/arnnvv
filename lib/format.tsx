import type { JSX, ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  let tableLines: Array<{ line: string; lineIndex: number }> = [];
  let inTable = false;
  let inBlockquote = false;
  let blockquoteContent: Array<{ content: string; lineIndex: number }> = [];

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
          {parseInline(currentParagraph.join(" "), elements.length)}
        </p>,
      );
      currentParagraph = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      elements.push(
        <SyntaxHighlighter
          key={`pre-${elements.length}`}
          language={codeBlockLanguage || "text"}
          style={vscDarkPlus}
          showLineNumbers={true}
          PreTag="div"
          className="my-4 rounded-lg"
        >
          {codeBlockContent.join("\n").trim()}
        </SyntaxHighlighter>
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
          className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 text-gray-600 dark:text-gray-400"
        >
          {blockquoteContent.map((entry) => (
            <p key={`blockquote-line-${entry.lineIndex}`}>
              {parseInline(entry.content, entry.lineIndex)}
            </p>
          ))}
        </blockquote>,
      );
      blockquoteContent = [];
    }
  };

  // ... (rest of the file remains exactly the same)
  // ... (isTableRow, parseTableRow, getColumnAlignment, renderTable, etc.)

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
    tableData: Array<{ line: string; lineIndex: number }>,
    key: number,
  ): JSX.Element | null => {
    if (tableData.length < 2) return null;

    const headers = parseTableRow(tableData[0].line);
    const separator = parseTableRow(tableData[1].line);
    const alignments = separator.map(getColumnAlignment);

    const rows: Array<{ cells: string[]; lineIndex: number }> = [];
    for (let i = 2; i < tableData.length; i++) {
      const row = parseTableRow(tableData[i].line);
      if (row.length === headers.length) {
        rows.push({ cells: row, lineIndex: tableData[i].lineIndex });
      }
    }

    if (headers.length === 0 || rows.length === 0) return null;

    return (
      <div className="my-6 overflow-x-auto">
        <table
          key={`table-${key}`}
          className="w-full text-left border-collapse"
        >
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={`th-${tableData[0].lineIndex}-${index}`}
                  className={`p-4 border-b-2 border-gray-200 dark:border-gray-700 pb-3 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider ${alignments[index]}`}
                >
                  {parseInline(header, tableData[0].lineIndex)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rowEntry) => (
              <tr 
                key={`tr-${rowEntry.lineIndex}`}
                className="border-b border-gray-200 dark:border-gray-800"
              >
                {rowEntry.cells.map((cell, cellIndex) => (
                  <td
                    key={`td-${rowEntry.lineIndex}-${cellIndex}`}
                    className={`p-4 ${alignments[cellIndex]}`}
                  >
                    {parseInline(cell, rowEntry.lineIndex + cellIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      blockquoteContent.push({
        content: line.replace(/^> /, "").trim(),
        lineIndex: lineIndex,
      });
      lineIndex++;
      continue;
    }
    if (inBlockquote) {
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
      tableLines.push({ line: originalLine, lineIndex: lineIndex });
      lineIndex++;
      continue;
    }
    if (inTable) {
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
          {parseInline(headerMatch[2], elements.length)}
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
        <li key={`li-${lineIndex}`} className="mb-2">
          {taskMatch && (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2 align-middle"
            />
          )}
          {parseInline(content, lineIndex)}
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
          className="my-6 border-t-2 border-gray-200 dark:border-gray-700"
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

const parseInline = (
  text: string,
  keySeed: string | number = "",
): ReactNode[] => {
  const elements: ReactNode[] = [];
  const regex =
    /(\*\*.*?\*\*|_.*?_|\*.*?\*|~~.*?~~|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  parts.forEach((part, index) => {
    if (!part) return;

    const uniqueKey = `${keySeed}-${part}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2);
      elements.push(
        <strong key={`bold-${uniqueKey}`} className="font-semibold">
          {content}
        </strong>,
      );
    } else if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      const content = part.slice(1, -1);
      elements.push(
        <em key={`italic-${uniqueKey}`} className="italic">
          {content}
        </em>,
      );
    } else if (part.startsWith("~~") && part.endsWith("~~")) {
      const content = part.slice(2, -2);
      elements.push(
        <del key={`del-${uniqueKey}`} className="line-through">
          {content}
        </del>,
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      const content = part.slice(1, -1);
      elements.push(
        <code
          key={`code-${uniqueKey}`}
          className="font-mono bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1 py-0.5 rounded"
        >
          {content}
        </code>,
      );
    } else if (part.startsWith("![")) {
      const match = part.match(/!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/);
      if (match) {
        const [, alt, src, title] = match;
        elements.push(
          <figure key={`figure-${uniqueKey}`} className="my-6 flex flex-col items-center">
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-lg dark:shadow-black/50"
              loading="lazy"
            />
            {title && (
              <figcaption className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400 italic">
                {title}
              </figcaption>
            )}
          </figure>
        );
      }
    } else if (part.startsWith("[") && part.includes("](")) {
      const match = part.match(/\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/);
      if (match) {
        const [, text, href, title] = match;
        elements.push(
          <a
            key={`link-${uniqueKey}`}
            href={href}
            className="text-blue-600 dark:text-blue-400 hover:underline"
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
        const segmentKey = `${uniqueKey}-seg-${segIndex}`;
        if (segment === "\n" || segment === "  \n") {
          elements.push(<br key={`br-${segmentKey}`} />);
        } else if (segment) {
          elements.push(<span key={`span-${segmentKey}`}>{segment}</span>);
        }
      });
    }
  });

  return elements;
};
