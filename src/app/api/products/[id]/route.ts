import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const b = await req.json();
  const p = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: b.name, sku: b.sku || null, barcode: b.barcode || null, brand: b.brand || null,
      categoryId: b.categoryId || null, supplierId: b.supplierId || null,
      costPrice: Number(b.costPrice ?? 0), salePrice: Number(b.salePrice ?? 0),
      minStock: Number(b.minStock ?? 0), unit: b.unit || "UN",
      controlByLot: !!b.controlByLot,
    },
  });
  await prisma.auditLog.create({ data: { userId: s.id, action: "UPDATE", entity: "Product", entityId: p.id, details: p.name } });
  return NextResponse.json(p);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await requireSession();
  const p = await prisma.product.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { userId: s.id, action: "DELETE_LOGIC", entity: "Product", entityId: p.id, details: p.name } });
  return NextResponse.json({ ok: true });
}
