import { MarkdownContent } from "./MarkdownContent";
import { RichHtmlContentLoader } from "./RichHtmlContentLoader";

interface BlogContentProps {
  content: string;
  format: "markdown" | "rich";
}

export function BlogContent({ content, format }: BlogContentProps) {
  if (format === "rich") {
    return <RichHtmlContentLoader content={content} />;
  }
  return <MarkdownContent content={content} />;
}
