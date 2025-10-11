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

const INLINE_RECURSIVE_REGEX =
  /(?<bolditalic>\*{3}(?:.|\n)+?\*{3}|_{3}(?:.|\n)+?_{3})|(?<bold>\*{2}(?:.|\n)+?\*{2}|_{2}(?:.|\n)+?_{2})|(?<italic>\*(?:.|\n)+?\*|_(?:.|\n)+?_)|(?<code>`[^`]*`)|(?<strike>~~(?:.|\n)+?~~)|(?<link>!?\[.*?\]\(.*?\))|(?<br> {2,}\n)/;

function renderInlineContent(text: string, keySeed: string): ReactNode[] {
  if (!text) return [];
  const match = text.match(INLINE_RECURSIVE_REGEX);
  if (!match || typeof match.index === "undefined") {
    return [text];
  }
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match[0].length);
  const groups = match.groups || {};
  let element: JSX.Element;
  const key = `${keySeed}-${match.index}`;

  if (groups.bolditalic) {
    const content = groups.bolditalic.slice(3, -3);
    element = (
      <strong key={key}>
        <em>{renderInlineContent(content, `${key}-bi`)}</em>
      </strong>
    );
  } else if (groups.bold) {
    const content = groups.bold.slice(2, -2);
    element = (
      <strong key={key}>{renderInlineContent(content, `${key}-b`)}</strong>
    );
  } else if (groups.italic) {
    const content = groups.italic.slice(1, -1);
    element = <em key={key}>{renderInlineContent(content, `${key}-i`)}</em>;
  } else if (groups.code) {
    const content = groups.code.slice(1, -1);
    element = (
      <code key={key} className={CONFIG.styling.inline.code}>
        {content}
      </code>
    );
  } else if (groups.strike) {
    const content = groups.strike.slice(2, -2);
    element = <del key={key}>{renderInlineContent(content, `${key}-s`)}</del>;
  } else if (groups.link) {
    const isImage = groups.link.startsWith("!");
    const linkMatch = groups.link.match(
      isImage
        ? /^!\[(.*?)]\((.*?)(?:\s+"(.*?)")?\)$/
        : /^\[(.*?)]\((.*?)(?:\s+"(.*?)")?\)$/,
    );
    if (linkMatch) {
      const [, textOrAlt = "", src = "", title = ""] = linkMatch;
      if (isImage) {
        element = (
          <span key={key} className={CONFIG.styling.inline.image} title={title}>
            <Image
              src={sanitizeUrl(src)}
              alt={textOrAlt}
              fill
              className={CONFIG.styling.image.image}
            />
          </span>
        );
      } else {
        element = (
          <a
            key={key}
            href={sanitizeUrl(src)}
            title={title}
            className={CONFIG.styling.inline.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderInlineContent(textOrAlt, `${key}-l`)}
          </a>
        );
      }
    } else {
      element = <span key={key}>{groups.link}</span>;
    }
  } else if (groups.br) {
    element = <br key={key} />;
  } else {
    element = <span key={key}>{match[0]}</span>;
  }
  return [
    ...renderInlineContent(before, `${keySeed}-before`),
    element,
    ...renderInlineContent(after, `${keySeed}-after`),
  ];
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
            {item.children &&
              item.children.items.length > 0 &&
              renderList(item.children)}
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
          {block.content.map((b) => renderBlock(b))}
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

function getIndent(line: string): number {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
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
    if (CONFIG.regex.blockquote.test(line)) {
      const bqLines: string[] = [];
      while (i < lines.length) {
        const currentLine = lines[i];
        if (CONFIG.regex.blockquote.test(currentLine)) {
          bqLines.push(currentLine.replace(/^>\s?/, ""));
          i++;
        } else if (
          currentLine.trim() === "" &&
          i + 1 < lines.length &&
          CONFIG.regex.blockquote.test(lines[i + 1])
        ) {
          bqLines.push("");
          i++;
        } else {
          break;
        }
      }
      blocks.push({
        type: "blockquote",
        key,
        content: parseToBlocks(bqLines.join("\n")),
      });
      continue;
    }
    if (CONFIG.regex.hr.test(line)) {
      blocks.push({ type: "hr", key });
      i++;
      continue;
    }
    if (CONFIG.regex.listItem.test(line)) {
      const listStack: { list: ListBlock; indent: number }[] = [];
      let listEndIndex = i;
      while (
        listEndIndex < lines.length &&
        (lines[listEndIndex].trim() === "" ||
          CONFIG.regex.listItem.test(lines[listEndIndex]))
      ) {
        listEndIndex++;
      }
      const listLines = lines.slice(i, listEndIndex);
      i = listEndIndex;

      listLines.forEach((itemLine, index) => {
        if (itemLine.trim() === "") return;
        const match = itemLine.match(CONFIG.regex.listItem);
        if (!match) return;
        const indent = getIndent(itemLine);
        const marker = match[2];
        const content = match[3];
        const newItem: ListItem = {
          key: `${key}-item-${index}`,
          content: content,
        };

        while (
          listStack.length > 0 &&
          indent < listStack[listStack.length - 1].indent
        ) {
          listStack.pop();
        }

        if (
          listStack.length === 0 ||
          indent > listStack[listStack.length - 1].indent
        ) {
          const listType = marker.match(/\d/) ? "ol" : "ul";
          const start = listType === "ol" ? parseInt(marker, 10) : undefined;
          const newList: ListBlock = {
            key: `${key}-list-${index}`,
            listType,
            start,
            items: [newItem],
          };

          if (listStack.length > 0) {
            const parentList = listStack[listStack.length - 1].list;
            const lastParentItem =
              parentList.items[parentList.items.length - 1];
            lastParentItem.children = newList;
          }
          listStack.push({ list: newList, indent });
        } else {
          listStack[listStack.length - 1].list.items.push(newItem);
        }
      });

      if (listStack.length > 0) {
        blocks.push({ type: "list", ...listStack[0].list });
      }
      continue;
    }
    const imageMatch = line.match(CONFIG.regex.image);
    if (imageMatch) {
      const [, alt = "", src = "", title = ""] = imageMatch;
      blocks.push({ type: "image", key, src, alt, title });
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
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !Object.values(CONFIG.regex).some((r) => r.test(lines[i]))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", key, content: paraLines.join("\n") });
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
  return blocks.map((block) => renderBlock(block));
};
