import Image from "next/image";
import type { JSX, ReactNode } from "react";
import { FORMATTER_CONFIG as CONFIG } from "./constants";
import type { ContentBlock, ListBlock, ListItem } from "./db/types";

function sanitizeUrl(raw: string | undefined | null): string {
  if (!raw) return "#";
  const s = String(raw).trim();
  if (s === "") return "#";
  if (s.startsWith("//")) return "#";
  if (s.startsWith("/") || s.startsWith("#") || s.startsWith(".")) {
    try {
      const encoded = encodeURI(s);
      if (encoded.includes("\n") || encoded.includes("\r")) return "#";
      return encoded;
    } catch (e) {
      console.error(e);
      return "#";
    }
  }
  try {
    const u = new URL(s);
    const proto = u.protocol.toLowerCase();
    if (proto === "http:" || proto === "https:" || proto === "mailto:") {
      return u.href;
    }
  } catch (e) {
    console.error(e);
  }
  return "#";
}

function renderInlineContent(text: string, keySeed: string): ReactNode[] {
  const parts = text.split(CONFIG.regex.inline).filter(Boolean);

  return parts.map((part, index) => {
    const key = `${keySeed}-inline-${index}`;

    if (part.startsWith("![")) {
      const match = part.match(/^!\[(.*?)]\((.*?)(?:\s+"(.*?)")?\)$/);
      if (!match) return part;
      const [, alt = "", src = "", title = ""] = match;
      return (
        <span key={key} className={CONFIG.styling.inline.image} title={title}>
          <Image
            src={sanitizeUrl(src)}
            alt={alt}
            fill
            className={CONFIG.styling.image.image}
          />
        </span>
      );
    }

    if (part.startsWith("[")) {
      const match = part.match(/\[(.*?)]\((.*?)(?:\s+"(.*?)")?\)/);
      if (!match) return part;
      const [, linkText = "", href = "", title = ""] = match;
      return (
        <a
          key={key}
          href={sanitizeUrl(href)}
          title={title}
          className={CONFIG.styling.inline.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkText}
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

    return part;
  });
}

function renderList(list: ListBlock): JSX.Element {
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
                aria-label={`Task item: ${content}`}
              />
            )}
            {renderInlineContent(content, item.key)}
            {item.children.items.length > 0 && renderList(item.children)}
          </li>
        );
      })}
    </ListTag>
  );
}

function renderTable(
  table: Extract<ContentBlock, { type: "table" }>,
): JSX.Element {
  const getAlignmentClass = (align: string) => {
    if (align === "text-center") return "text-center";
    if (align === "text-right") return "text-right";
    return "text-left";
  };
  return (
    <div key={table.key} className={CONFIG.styling.table.container}>
      <table className={CONFIG.styling.table.table}>
        <thead>
          <tr>
            {table.headers.map((header, index) => (
              <th
                key={`${table.key}-th-${index}`}
                className={`${CONFIG.styling.table.th} ${getAlignmentClass(
                  table.alignments[index],
                )}`}
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
                  className={`${CONFIG.styling.table.td} ${getAlignmentClass(
                    table.alignments[cellIndex],
                  )}`}
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
}

function renderBlock(block: ContentBlock): JSX.Element | null {
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
            <p key={`${block.key}-line-${index}`} className="mb-0">
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

    case "image": {
      return (
        <figure key={block.key} className={CONFIG.styling.image.figure}>
          <div className={CONFIG.styling.image.container}>
            <Image
              src={sanitizeUrl(block.src)}
              alt={block.alt}
              title={block.title}
              fill
              className={CONFIG.styling.image.image}
            />
          </div>
          {block.title && (
            <figcaption className={CONFIG.styling.image.caption}>
              {block.title}
            </figcaption>
          )}
        </figure>
      );
    }
    default: {
      return null;
    }
  }
}

function parseToBlocks(content: string): ContentBlock[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `block-${i}`;

    if (line.trim() === "") {
      i++;
      continue;
    }

    const imageMatch = line.match(CONFIG.regex.image);
    if (imageMatch) {
      const [, alt = "", src = "", title = ""] = imageMatch;
      blocks.push({ type: "image", key, src, alt, title });
      i++;
      continue;
    }
    const headerMatch = line.match(CONFIG.regex.header);
    if (headerMatch) {
      blocks.push({
        type: "header",
        key,
        level: Math.min(headerMatch[1].length, 6),
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
      let temp_i = i + 1;
      while (
        temp_i < lines.length &&
        CONFIG.regex.tableRow.test(lines[temp_i])
      ) {
        tableLines.push(lines[temp_i]);
        temp_i++;
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
      i = temp_i;
      continue;
    }

    if (CONFIG.regex.listItem.test(line)) {
      const listLines: string[] = [];
      let temp_i = i;
      while (
        temp_i < lines.length &&
        (CONFIG.regex.listItem.test(lines[temp_i]) ||
          (lines[temp_i].trim() === "" &&
            temp_i + 1 < lines.length &&
            lines[temp_i + 1].startsWith(" ")))
      ) {
        listLines.push(lines[temp_i]);
        temp_i++;
      }
      const firstMatch = listLines[0]?.match(CONFIG.regex.listItem);
      if (firstMatch) {
        const listType = firstMatch[2].match(/\d/) ? "ol" : "ul";
        const start =
          listType === "ol" ? parseInt(firstMatch[2], 10) : undefined;

        const items = listLines
          .map((itemLine, itemIndex): ListItem | null => {
            const match = itemLine.match(CONFIG.regex.listItem);
            if (!match) return null;
            return {
              key: `item-${i}-${itemIndex}`,
              content: match[3],
              children: {
                key: `child-list-${i}-${itemIndex}`,
                listType: "ul",
                items: [],
              },
            };
          })
          .filter((item): item is ListItem => item !== null);

        blocks.push({ type: "list", key, listType, start, items });
        i = temp_i;
        continue;
      }
    }

    const paraLines: string[] = [];
    let temp_i = i;
    while (
      temp_i < lines.length &&
      lines[temp_i].trim() !== "" &&
      !CONFIG.regex.header.test(lines[temp_i]) &&
      !CONFIG.regex.codeFence.test(lines[temp_i]) &&
      !CONFIG.regex.blockquote.test(lines[temp_i]) &&
      !CONFIG.regex.hr.test(lines[temp_i]) &&
      !CONFIG.regex.listItem.test(lines[temp_i]) &&
      !CONFIG.regex.image.test(lines[temp_i]) &&
      !(
        CONFIG.regex.tableRow.test(lines[temp_i]) &&
        temp_i + 1 < lines.length &&
        CONFIG.regex.tableSeparator.test(lines[temp_i + 1])
      )
    ) {
      paraLines.push(lines[temp_i]);
      temp_i++;
    }
    blocks.push({ type: "paragraph", key, content: paraLines.join("\n") });
    i = temp_i;
  }
  return blocks;
}

export const formatContent = (
  content?: string | null,
): (JSX.Element | null)[] => {
  if (!content) {
    return [];
  }
  const blocks = parseToBlocks(content);
  return blocks.map(renderBlock);
};
