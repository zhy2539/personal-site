"use client";

import dynamic from "next/dynamic";

const RichHtmlContent = dynamic(
  () => import("./RichHtmlContent").then((mod) => mod.RichHtmlContent),
  { ssr: false }
);

interface RichHtmlContentLoaderProps {
  content: string;
}

export function RichHtmlContentLoader({ content }: RichHtmlContentLoaderProps) {
  return <RichHtmlContent content={content} />;
}
