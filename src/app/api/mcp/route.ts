import { NextRequest, NextResponse } from "next/server";
import { getMcpItems, saveMcpItems, slugifyId } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/auth";
import type { ResourceItem } from "@/types";

export async function GET() {
  const items = await getMcpItems();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<ResourceItem>;
  if (!body.name || !body.url) {
    return NextResponse.json({ error: "名称和链接为必填" }, { status: 400 });
  }
  const items = await getMcpItems();
  const newItem: ResourceItem = {
    id: body.id ?? slugifyId(body.name),
    name: body.name,
    description: body.description ?? "",
    url: body.url,
    tags: body.tags ?? [],
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  if (items.some((i) => i.id === newItem.id)) {
    return NextResponse.json({ error: "ID 已存在" }, { status: 409 });
  }
  items.push(newItem);
  await saveMcpItems(items);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = (await request.json()) as ResourceItem;
  if (!body.id) {
    return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  }
  const items = await getMcpItems();
  const index = items.findIndex((i) => i.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  items[index] = {
    ...items[index],
    ...body,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  await saveMcpItems(items);
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
  const items = await getMcpItems();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  await saveMcpItems(filtered);
  return NextResponse.json({ ok: true });
}
