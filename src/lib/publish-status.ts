export type PublishStepStatus = "success" | "warning" | "error" | "pending";

export interface PublishStep {
  name: string;
  status: PublishStepStatus;
  message: string;
}

export interface PublishResult {
  success: boolean;
  slug: string;
  previewUrl: string;
  steps: PublishStep[];
  message: string;
}

export function buildPreviewUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/blog/${slug}`;
}
