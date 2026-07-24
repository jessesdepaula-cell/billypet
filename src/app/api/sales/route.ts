import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const b = await req.json();
  const total = Number(b.total ?? 0);
  if (b.tutorId) {
    const t = await prisma.tutor.findFirst({ where: { id: b.tutorId, tenantId: ctx.tenantId } });
    if (!t) return NextResponse.json({ error: "Tutor invalido" }, { status: 400 });
  }

  // Valida que todos os produtos/servicos dos itens pertencem ao tenant (evita cross-tenant)
  const items = Array.isArray(b.items) ? b.items : [];
  const productIds = [...new Set(items.map((it: any) => it.productId).filter(Boolean))] as string[];
  const serviceIds = [...new Set(items.map((it: any) => it.serviceId).filter(Boolean))] as string[];
  if (productIds.length > 0) {
    const count = await prisma.product.count({ where: { id: { in: productIds }, tenantId: ctx.tenantId } });
    if (count !== productIds.length) return NextResponse.json({ error: "Produto invalido" }, { status: 400 });
  }
  if (serviceIds.length > 0) {
    const count = await prisma.service.count({ where: { id: { in: serviceIds }, tenantId: ctx.tenantId } });
    if (count !== serviceIds.length) return NextResponse.json({ error: "Servico invalido" }, { status: 400 });
  }
  const sale = await prisma.sale.create({
    data: {
      unitId: ctx.unitId, tutorId: b.tutorId || null, sellerId: ctx.session.id,
      discount: Number(b.discount ?? 0), surcharge: Number(b.surcharge ?? 0),
      total, status: "FINALIZADA", notes: b.notes,
      items: { create: (b.items ?? []).map((it: any) => ({
        productId: it.productId || null, serviceId: it.serviceId || null,
        description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), total: Number(it.total),
      })) },
      payments: { create: (b.payments ?? []).map((p: any) => ({ paymentMethodId: p.paymentMethodId, amount: Number(p.amount), installments: Number(p.installments ?? 1) })) },
    },
    include: { items: true },
  });
  for (const it of sale.items) {
    if (!it.productId) continue;
    const stock = await prisma.stock.findFirst({ where: { productId: it.productId, unitId: ctx.unitId } });
    if (stock) {
      // Nao deixa o estoque ficar negativo
      const newQty = Math.max(0, stock.quantity - it.quantity);
      await prisma.stock.update({ where: { id: stock.id }, data: { quantity: newQty } });
    }
    await prisma.stockMovement.create({ data: { productId: it.productId, unitId: ctx.unitId, quantity: -it.quantity, type: "SAIDA_VENDA", reference: sale.id } });
  }
  if (b.tutorId) {
    const points = Math.floor(total / 10);
    if (points > 0) {
      await prisma.loyaltyTransaction.create({ data: { tutorId: b.tutorId, points, reason: `Venda #${sale.id.slice(-6)}` } });
      await prisma.tutor.update({ where: { id: b.tutorId }, data: { loyaltyPoints: { increment: points } } });
    }
  }
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "CREATE", entity: "Sale", entityId: sale.id, details: `Total ${total}` } });
  return NextResponse.json(sale);
}
