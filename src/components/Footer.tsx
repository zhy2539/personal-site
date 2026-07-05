import { siteConfig } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          © {year} {siteConfig.author} · 用 Next.js 构建
        </p>
      </div>
    </footer>
  );
}
