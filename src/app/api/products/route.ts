import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const products = await prisma.product.findMany({
    where: {
      tenantId: ctx.tenantId,
      isActive: true,
      ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }, { barcode: { contains: q } }, { brand: { contains: q } }] } : {}),
    },
    include: { category: true, supplier: true, stocks: true },
    orderBy: { name: "asc" }, take: 300,
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const p = await prisma.product.create({
    data: {
      tenantId: ctx.tenantId,
      name: b.name, sku: b.sku || null, barcode: b.barcode || null, brand: b.brand || null,
      categoryId: b.categoryId || null, supplierId: b.supplierId || null,
      costPrice: Number(b.costPrice ?? 0), salePrice: Number(b.salePrice ?? 0),
      minStock: Number(b.minStock ?? 0), unit: b.unit || "UN",
      controlByLot: !!b.controlByLot,
    },
  });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Product", entityId: p.id, details: p.name } });
  return NextResponse.json(p);
}
