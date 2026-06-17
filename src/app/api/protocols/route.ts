import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

export async function GET(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { searchParams } = new URL(req.url);
  const petId = searchParams.get("petId");
  if (!petId) return NextResponse.json({ error: "petId e obrigatorio" }, { status: 400 });

  const list = await prisma.protocol.findMany({
    where: { petId, tenantId: ctx.tenantId },
    include: { doses: { orderBy: { dueDate: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const b = await req.json();
  const petId = b.petId;
  const name = String(b.name || "").trim();
  const type = String(b.type || "").trim();
  const startDate = new Date(b.startDate);

  if (!petId || !name || !type || !b.startDate) {
    return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  }

  let dosesToCreate: any[] = [];
  if (b.templateId) {
    const template = await prisma.protocolTemplate.findFirst({
      where: { id: b.templateId, tenantId: ctx.tenantId },
      include: { doses: true },
    });
    if (template) {
      dosesToCreate = template.doses.map((td) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + td.daysOffset);
        return {
          dueDate: d,
          status: "PENDENTE",
          notes: td.name, // using name of dose here
        };
      });
    }
  } else if (b.doses && Array.isArray(b.doses)) {
    dosesToCreate = b.doses.map((d: any) => {
      const dued = new Date(startDate);
      dued.setDate(dued.getDate() + (parseInt(d.daysOffset) || 0));
      return {
        dueDate: dued,
        status: "PENDENTE",
        notes: d.name,
      };
    });
  }

  const p = await prisma.protocol.create({
    data: {
      tenantId: ctx.tenantId,
      petId,
      name,
      type,
      startDate,
      notes: b.notes || null,
      status: "ATIVO",
      doses: {
        create: dosesToCreate,
      },
    },
    include: { doses: true },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: ctx.tenantId,
      userId: ctx.session.id,
      action: "CREATE_PROTOCOL",
      entity: "Protocol",
      entityId: p.id,
    },
  });

  return NextResponse.json(p);
}
