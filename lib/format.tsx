import Image from "next/image";
import type { JSX, ReactNode } from "react";

const CONFIG = {
  styling: {
    header: [
      "text-3xl font-bold mt-6 mb-4",
      "text-2xl font-bold mt-6 mb-4",
      "text-xl font-bold mt-6 mb-4",
      "text-lg font-bold mt-6 mb-4",
      "text-base font-bold mt-6 mb-4",
      "text-sm font-bold mt-6 mb-4",
    ],
    paragraph: "mb-4 leading-relaxed",
    codeBlock: {
      pre: "bg-muted text-gray-800 dark:text-gray-200 p-4 my-4 rounded-lg overflow-x-auto",
      code: "font-mono text-sm",
    },
    blockquote:
      "border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 text-gray-600 dark:text-gray-400",
    image: {
      figure: "my-6",
      container:
        "relative w-full aspect-video overflow-hidden rounded-lg shadow-lg dark:shadow-black/50",
      image: "object-contain",
      caption:
        "mt-3 text-sm text-center text-gray-500 dark:text-gray-400 italic",
    },
    hr: "my-6 border-t-2 border-gray-200 dark:border-gray-700",
    list: {
      ul: "list-disc list-inside mb-4 pl-4",
      ol: "list-decimal list-inside mb-4 pl-4",
      listItem: "mb-2",
      checkbox: "mr-2 align-middle",
    },
    table: {
      container: "my-6 overflow-x-auto",
      table: "w-full text-left border-collapse",
      th: "p-4 border-b-2 border-gray-200 dark:border-gray-700 pb-3 text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider",
      tr: "border-b border-gray-200 dark:border-gray-800",
      td: "p-4",
    },
    inline: {
      code: "font-mono bg-muted text-red-500 dark:text-red-400 px-1 py-0.5 rounded",
      link: "text-blue-600 dark:text-blue-400 hover:underline",
    },
  },
  regex: {
    inline:
      /(\!?\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~| {2,}\n)/g,
    header: /^(#+)\s(.*)/,
    blockquote: /^>\s?(.*)/,
    listItem: /^(\s*)(\*|-|\d+\.)\s(.*)/,
    taskListItem: /^\[( |x)\]\s(.*)/,
    codeFence: /^```/,
    hr: /^(---|\*\*\*|___)\s*$/,
    tableRow: /^\s*\|.*\|\s*$/,
    tableSeparator: /^\s*\|?.*[-:]+.*\|?\s*$/,
  },
};

interface ListItem {
  key: string;
  content: string;
  children: ListBlock;
}

type ListBlock = {
  key: string;
  listType: "ul" | "ol";
  start?: number;
  items: ListItem[];
};

type ContentBlock =
  | { type: "header"; key: string; level: number; content: string }
  | { type: "paragraph"; key: string; content: string }
  | { type: "code"; key: string; content: string }
  | { type: "blockquote"; key: string; content: string[] }
  | { type: "image"; key: string; src: string; alt: string; title?: string }
  | {
      type: "table";
      key: string;
      headers: string[];
      alignments: string[];
      rows: string[][];
    }
  | { type: "hr"; key: string }
  | ({ type: "list" } & ListBlock);

const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
      return url;
    }
  } catch (e) {
    console.error(e);
  }
  return "#";
};

const renderInlineContent = (text: string, keySeed: string): ReactNode[] => {
  const parts = text.split(CONFIG.regex.inline).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keySeed}-inline-${index}`;

    if (part.startsWith("![")) {
      const match = part.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
      if (!match) return <span key={key}>{part}</span>;
      const [, alt, src, title] = match;
      return (
        <figure key={key} className={CONFIG.styling.image.figure}>
          <div className={CONFIG.styling.image.container}>
            <Image
              src={sanitizeUrl(src)}
              alt={alt}
              title={title}
              fill
              className={CONFIG.styling.image.image}
            />
          </div>
          {title && (
            <figcaption className={CONFIG.styling.image.caption}>
              {title}
            </figcaption>
          )}
        </figure>
      );
    }

    if (part.startsWith("[")) {
      const match = part.match(/\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/);
      if (!match) return <span key={key}>{part}</span>;
      const [, text, href, title] = match;
      return (
        <a
          key={key}
          href={sanitizeUrl(href)}
          title={title}
          className={CONFIG.styling.inline.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      );
    }

    if (part.startsWith("**") || part.startsWith("__"))
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") || part.startsWith("_"))
      return <em key={key}>{part.slice(1, -1)}</em>;
    if (part.startsWith("~~")) return <del key={key}>{part.slice(2, -2)}</del>;
    if (part.startsWith("`"))
      return (
        <code key={key} className={CONFIG.styling.inline.code}>
          {part.slice(1, -1)}
        </code>
      );
    if (part.match(/ {2,}\n/)) return <br key={key} />;

    return <span key={key}>{part}</span>;
  });
};

const renderList = (list: ListBlock): JSX.Element => {
  const ListTag = list.listType;
  return (
    <ListTag
      key={list.key}
      start={list.start}
      className={CONFIG.styling.list[ListTag]}
    >
      {list.items.map((item) => {
        const taskMatch = item.content.match(CONFIG.regex.taskListItem);
        const content = taskMatch ? taskMatch[2] : item.content;
        const isChecked = taskMatch ? taskMatch[1] === "x" : false;

        return (
          <li key={item.key} className={CONFIG.styling.list.listItem}>
            {taskMatch && (
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                className={CONFIG.styling.list.checkbox}
              />
            )}
            {renderInlineContent(content, item.key)}
            {item.children.items.length > 0 && renderList(item.children)}
          </li>
        );
      })}
    </ListTag>
  );
};

const renderTable = (
  table: Extract<ContentBlock, { type: "table" }>,
): JSX.Element => {
  return (
    <div key={table.key} className={CONFIG.styling.table.container}>
      <table className={CONFIG.styling.table.table}>
        <thead>
          <tr>
            {table.headers.map((header, index) => (
              <th
                key={`${table.key}-th-${index}`}
                className={`${CONFIG.styling.table.th} ${table.alignments[index]}`}
              >
                {renderInlineContent(header, `${table.key}-th-${index}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={`${table.key}-tr-${rowIndex}`}
              className={CONFIG.styling.table.tr}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${table.key}-td-${rowIndex}-${cellIndex}`}
                  className={`${CONFIG.styling.table.td} ${table.alignments[cellIndex]}`}
                >
                  {renderInlineContent(
                    cell,
                    `${table.key}-td-${rowIndex}-${cellIndex}`,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderBlock = (block: ContentBlock): JSX.Element => {
  switch (block.type) {
    case "header": {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag key={block.key} className={CONFIG.styling.header[block.level - 1]}>
          {renderInlineContent(block.content, block.key)}
        </Tag>
      );
    }

    case "paragraph": {
      return (
        <p key={block.key} className={CONFIG.styling.paragraph}>
          {renderInlineContent(block.content, block.key)}
        </p>
      );
    }

    case "code": {
      return (
        <pre key={block.key} className={CONFIG.styling.codeBlock.pre}>
          <code className={CONFIG.styling.codeBlock.code}>{block.content}</code>
        </pre>
      );
    }

    case "blockquote": {
      return (
        <blockquote key={block.key} className={CONFIG.styling.blockquote}>
          {block.content.map((line, index) => (
            <p key={`${block.key}-line-${index}`}>
              {renderInlineContent(line, `${block.key}-line-${index}`)}
            </p>
          ))}
        </blockquote>
      );
    }

    case "hr": {
      return <hr key={block.key} className={CONFIG.styling.hr} />;
    }

    case "list": {
      return renderList(block);
    }

    case "table": {
      return renderTable(block);
    }

    default: {
      return <></>;
    }
  }
};

const parseToBlocks = (content: string): ContentBlock[] => {
  const lines = content.split("\n");
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `block-${i}`;

    if (line.trim() === "") {
      i++;
      continue;
    }
    const headerMatch = line.match(CONFIG.regex.header);
    if (headerMatch) {
      blocks.push({
        type: "header",
        key,
        level: headerMatch[1].length,
        content: headerMatch[2],
      });
      i++;
      continue;
    }
    if (CONFIG.regex.codeFence.test(line)) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !CONFIG.regex.codeFence.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", key, content: codeLines.join("\n") });
      i++;
      continue;
    }
    if (CONFIG.regex.blockquote.test(line)) {
      const bqLines: string[] = [];
      while (i < lines.length && CONFIG.regex.blockquote.test(lines[i])) {
        bqLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "blockquote", key, content: bqLines });
      continue;
    }
    if (CONFIG.regex.hr.test(line)) {
      blocks.push({ type: "hr", key });
      i++;
      continue;
    }
    if (
      CONFIG.regex.tableRow.test(line) &&
      i + 1 < lines.length &&
      CONFIG.regex.tableSeparator.test(lines[i + 1])
    ) {
      const tableLines = [line];
      i++;
      while (i < lines.length && CONFIG.regex.tableRow.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const headers = tableLines[0]
        .split("|")
        .slice(1, -1)
        .map((s) => s.trim());
      const alignments = tableLines[1]
        .split("|")
        .slice(1, -1)
        .map((s) => {
          const cell = s.trim();
          if (cell.startsWith(":") && cell.endsWith(":")) return "text-center";
          if (cell.endsWith(":")) return "text-right";
          return "text-left";
        });
      const rows = tableLines.slice(2).map((rowLine) =>
        rowLine
          .split("|")
          .slice(1, -1)
          .map((s) => s.trim()),
      );
      blocks.push({ type: "table", key, headers, alignments, rows });
      continue;
    }
    if (CONFIG.regex.listItem.test(line)) {
      const listLines = [];
      while (
        i < lines.length &&
        (CONFIG.regex.listItem.test(lines[i]) ||
          lines[i].trim() === "" ||
          lines[i].startsWith("    "))
      ) {
        listLines.push(lines[i]);
        i++;
      }

      const parseListItemsRecursive = (
        listLines: string[],
        indentLevel: number,
      ): ListItem[] => {
        const items: ListItem[] = [];
        let j = 0;
        while (j < listLines.length) {
          const itemLine = listLines[j];
          const match = itemLine.match(CONFIG.regex.listItem);
          if (!match || match[1].length !== indentLevel) {
            j++;
            continue;
          }
          const contentLines = [match[3]];
          const childLines = [];
          j++;
          while (j < listLines.length) {
            const nextLine = listLines[j];
            const nextMatch = nextLine.match(CONFIG.regex.listItem);
            if (nextMatch) {
              if (nextMatch[1].length > indentLevel) {
                childLines.push(nextLine);
              } else {
                break;
              }
            } else if (nextLine.trim() !== "") {
              contentLines.push(nextLine.trim());
            } else {
              break;
            }
            j++;
          }

          const firstMatch = itemLine.match(CONFIG.regex.listItem)!;
          items.push({
            key: `item-${i}-${j}`,
            content: contentLines.join("\n"),
            children: {
              key: `child-${i}-${j}`,
              listType: firstMatch[2].match(/\d/) ? "ol" : "ul",
              start: firstMatch[2].match(/\d/)
                ? parseInt(firstMatch[2])
                : undefined,
              items: parseListItemsRecursive(childLines, indentLevel + 2),
            },
          });
        }
        return items;
      };

      const firstMatch = listLines[0].match(CONFIG.regex.listItem)!;
      const listType = firstMatch[2].match(/\d/) ? "ol" : "ul";
      const start = listType === "ol" ? parseInt(firstMatch[2]) : undefined;
      const items = parseListItemsRecursive(listLines, firstMatch[1].length);
      blocks.push({ type: "list", key, listType, start, items });
      continue;
    }
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !Object.values(CONFIG.regex).some((r) => r.test(lines[i]))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", key, content: paraLines.join("\n") });
  }

  return blocks;
};

export const formatContent = (content?: string | null): JSX.Element[] => {
  if (!content) {
    return [];
  }
  const blocks = parseToBlocks(content);
  return blocks.map(renderBlock);
};
