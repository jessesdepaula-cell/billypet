import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTenantApi, isTenantError } from "@/lib/tenant";

async function fetchOwned(id: string, tenantId: string) {
  return prisma.pet.findFirst({ where: { id, tutor: { tenantId } } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await fetchOwned(params.id, ctx.tenantId);
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const b = await req.json();

  // Só mexe no peso quando ele vier no payload; evita zerar o peso em updates que nao o incluem (ex.: obito).
  let nextWeight: number | null | undefined = undefined;
  if (b.weightKg !== undefined) {
    nextWeight = b.weightKg === "" || b.weightKg === null ? null : Number(b.weightKg);
    if (nextWeight !== null && Number.isNaN(nextWeight)) nextWeight = null;
  }
  const weightChanged = nextWeight !== undefined && nextWeight !== null && nextWeight > 0 && nextWeight !== owned.weightKg;

  const changes: string[] = [];
  if (b.name !== undefined && b.name !== owned.name) {
    changes.push(`Nome: "${owned.name || ""}" → "${b.name || ""}"`);
  }
  if (b.species !== undefined && b.species !== owned.species) {
    changes.push(`Espécie: "${owned.species || ""}" → "${b.species || ""}"`);
  }
  if (b.breed !== undefined && b.breed !== owned.breed) {
    changes.push(`Raça: "${owned.breed || ""}" → "${b.breed || ""}"`);
  }
  if (b.sex !== undefined && b.sex !== owned.sex) {
    changes.push(`Sexo: "${owned.sex || ""}" → "${b.sex || ""}"`);
  }
  if (b.neutered !== undefined && b.neutered !== owned.neutered) {
    const fromStr = owned.neutered === true ? "Sim" : owned.neutered === false ? "Não" : "Não especificado";
    const toStr = b.neutered === true ? "Sim" : b.neutered === false ? "Não" : "Não especificado";
    changes.push(`Castrado: "${fromStr}" → "${toStr}"`);
  }
  if (b.birthDate !== undefined) {
    const oldBirth = owned.birthDate ? new Date(owned.birthDate).toISOString().slice(0, 10) : "";
    const newBirth = b.birthDate ? new Date(b.birthDate).toISOString().slice(0, 10) : "";
    if (oldBirth !== newBirth) {
      changes.push(`Nascimento: "${oldBirth}" → "${newBirth}"`);
    }
  }
  if (nextWeight !== undefined && nextWeight !== owned.weightKg) {
    const fromW = owned.weightKg !== null && owned.weightKg !== undefined ? `${owned.weightKg} kg` : "não informado";
    const toW = nextWeight !== null && nextWeight !== undefined ? `${nextWeight} kg` : "não informado";
    changes.push(`Peso: ${fromW} → ${toW}`);
  }
  if (b.color !== undefined && b.color !== owned.color) {
    changes.push(`Cor: "${owned.color || ""}" → "${b.color || ""}"`);
  }
  if (b.microchip !== undefined && b.microchip !== owned.microchip) {
    changes.push(`Microchip: "${owned.microchip || ""}" → "${b.microchip || ""}"`);
  }
  if (b.notes !== undefined && b.notes !== owned.notes) {
    changes.push("Observações alteradas");
  }
  if (b.medicalAlert !== undefined && b.medicalAlert !== owned.medicalAlert) {
    changes.push(`Alerta médico: "${owned.medicalAlert || ""}" → "${b.medicalAlert || ""}"`);
  }
  if (b.deceased !== undefined && b.deceased !== owned.deceased) {
    changes.push(`Status óbito: "${owned.deceased ? "Sim" : "Não"}" → "${b.deceased ? "Sim" : "Não"}"`);
  }

  const detailsText = changes.length > 0 ? changes.join(", ") : "Ficha atualizada";

  const p = await prisma.pet.update({
    where: { id: params.id },
    data: {
      name: b.name, species: b.species, breed: b.breed, sex: b.sex,
      neutered: typeof b.neutered === "boolean" ? b.neutered : null,
      birthDate: b.birthDate ? new Date(b.birthDate) : null,
      weightKg: nextWeight,
      color: b.color, microchip: b.microchip, notes: b.notes, medicalAlert: b.medicalAlert,
      deceased: b.deceased !== undefined ? !!b.deceased : undefined,
      deceasedAt: b.deceasedAt !== undefined ? (b.deceasedAt ? new Date(b.deceasedAt) : null) : undefined,
    },
  });
  if (weightChanged) {
    await prisma.weightRecord.create({ data: { petId: p.id, weightKg: nextWeight as number, source: "MANUAL" } });
  }
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "UPDATE", entity: "Pet", entityId: p.id, details: detailsText } });
  return NextResponse.json(p);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireTenantApi();
  if (isTenantError(ctx)) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const owned = await fetchOwned(params.id, ctx.tenantId);
  if (!owned) return NextResponse.json({ error: "Nao encontrado" }, { status: 404 });
  const p = await prisma.pet.update({ where: { id: params.id }, data: { isActive: false } });
  await prisma.auditLog.create({ data: { tenantId: ctx.tenantId, userId: ctx.session.id, action: "DELETE_LOGIC", entity: "Pet", entityId: p.id, details: p.name } });
  return NextResponse.json({ ok: true });
}
