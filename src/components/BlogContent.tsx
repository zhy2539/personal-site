import DOMPurify from "isomorphic-dompurify";
import { MarkdownContent } from "./MarkdownContent";

interface BlogContentProps {
  content: string;
  format: "markdown" | "rich";
}

const proseClass =
  "prose prose-zinc max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600 prose-pre:bg-zinc-900 prose-img:rounded-lg";

export function BlogContent({ content, format }: BlogContentProps) {
  if (format === "rich") {
    const safe = DOMPurify.sanitize(content, {
      ADD_ATTR: ["target", "rel"],
    });
    return (
      <div
        className={proseClass}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }
  return <MarkdownContent content={content} />;
}
