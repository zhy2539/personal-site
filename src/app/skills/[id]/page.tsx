import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkillDetailView } from "@/components/SkillDetailView";
import { getSkillById, getSkillItems } from "@/lib/data";

interface SkillDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const items = await getSkillItems();
  return items.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: SkillDetailPageProps) {
  const { id } = await params;
  const skill = await getSkillById(id);
  if (!skill) return { title: "Skill 未找到" };
  return {
    title: skill.name,
    description: skill.description,
  };
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { id } = await params;
  const skill = await getSkillById(id);
  if (!skill) notFound();

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link
          href="/skills"
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← 返回 Skill 目录
        </Link>
        <div className="mt-6">
          <SkillDetailView skill={skill} />
        </div>
      </main>
      <Footer />
    </>
  );
}
