import type { PublishResult, PublishStepStatus } from "@/lib/publish-status";

const statusStyles: Record<PublishStepStatus, string> = {
  success: "border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  pending: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
};

const statusIcon: Record<PublishStepStatus, string> = {
  success: "✓",
  warning: "⚠",
  error: "✗",
  pending: "…",
};

interface PublishStatusBannerProps {
  result: PublishResult | null;
  onClose: () => void;
}

export function PublishStatusBanner({ result, onClose }: PublishStatusBannerProps) {
  if (!result) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border p-4 ${
        result.success
          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
          : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
            {result.success ? "发布成功" : "发布失败"}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {result.message}
          </p>
          {result.success && (
            <a
              href={result.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              查看前台文章 →
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="min-h-[44px] min-w-[44px] rounded-lg px-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {result.steps.map((step) => (
          <li
            key={step.name}
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${statusStyles[step.status]}`}
          >
            <span aria-hidden="true" className="mt-0.5 font-bold">
              {statusIcon[step.status]}
            </span>
            <div>
              <p className="font-medium">{step.name}</p>
              <p className="opacity-90">{step.message}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
