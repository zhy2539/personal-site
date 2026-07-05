import { NextRequest, NextResponse } from "next/server";
import { getSkillItems, saveSkillItems, slugifyId } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/auth";
import { normalizeSkillItem } from "@/lib/skill-utils";
import type { SkillItem } from "@/types";

function buildSkill(body: Partial<SkillItem>, existing?: SkillItem): SkillItem {
  const normalized = normalizeSkillItem({
    id: body.id ?? existing?.id ?? slugifyId(body.name!),
    name: body.name ?? existing?.name ?? "",
    url: body.url ?? existing?.url ?? "",
    description: body.description ?? existing?.description,
    tags: body.tags ?? existing?.tags,
    intro: body.intro ?? existing?.intro,
    workflow: body.workflow ?? existing?.workflow,
    useCases: body.useCases ?? existing?.useCases,
    prerequisites: body.prerequisites ?? existing?.prerequisites,
    tips: body.tips ?? existing?.tips,
  });
  return {
    ...normalized,
    id: normalized.id || slugifyId(normalized.name),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

export async function GET() {
  const items = await getSkillItems();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<SkillItem>;
  if (!body.name || !body.url) {
    return NextResponse.json({ error: "名称和链接为必填" }, { status: 400 });
  }
  const items = await getSkillItems();
  const newItem = buildSkill(body);
  if (items.some((i) => i.id === newItem.id)) {
    return NextResponse.json({ error: "ID 已存在" }, { status: 409 });
  }
  items.push(newItem);
  await saveSkillItems(items);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<SkillItem> & { id: string };
  if (!body.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const items = await getSkillItems();
  const index = items.findIndex((i) => i.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  items[index] = buildSkill(body, items[index]);
  await saveSkillItems(items);
  return NextResponse.json(items[index]);
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const items = await getSkillItems();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  await saveSkillItems(filtered);
  return NextResponse.json({ ok: true });
}
