import Link from "next/link";
import type { SkillItem } from "@/types";

interface SkillDetailViewProps {
  skill: SkillItem;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SkillDetailView({ skill }: SkillDetailViewProps) {
  return (
    <article>
      <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {skill.tags.map((tag) => (
            <Link
              key={tag}
              href={`/skills?tag=${encodeURIComponent(tag)}`}
              className="inline-flex min-h-[32px] items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </Link>
          ))}
          <time
            dateTime={skill.updatedAt}
            className="ml-auto text-sm text-zinc-400"
          >
            更新于 {skill.updatedAt}
          </time>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {skill.name}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {skill.description}
        </p>
        <a
          href={skill.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          访问官方资源 ↗
        </a>
      </header>

      <Section title="简介">
        <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
          {skill.intro}
        </p>
      </Section>

      <Section title="使用流程">
        <ol className="space-y-3">
          {skill.workflow.map((step, index) => (
            <li key={index} className="flex gap-4">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <p className="pt-1 leading-relaxed text-zinc-700 dark:text-zinc-300">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="适用场景">
        <ul className="grid gap-2 sm:grid-cols-2">
          {skill.useCases.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <span className="mt-0.5 text-blue-600 dark:text-blue-400" aria-hidden="true">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="前置条件">
        <ul className="list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          {skill.prerequisites.map((item) => (
            <li key={item} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="使用提示">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
          <ul className="space-y-2">
            {skill.tips.map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-sm leading-relaxed text-amber-900 dark:text-amber-200"
              >
                <span aria-hidden="true">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </article>
  );
}
