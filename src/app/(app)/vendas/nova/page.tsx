import { prisma } from "@/lib/db";
import { requireModule } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { POS } from "./POS";

export const dynamic = "force-dynamic";

export default async function NovaVendaPage({ searchParams }: { searchParams: { tutorId?: string } }) {
  const { tenantId } = await requireModule("vendas");
  const [tutors, products, services, methods] = await Promise.all([
    prisma.tutor.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, salePrice: true } }),
    prisma.service.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, price: true } }),
    prisma.paymentMethod.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Nova venda" description="PDV - registre produtos, servicos e pagamentos" />
      <POS tutors={tutors} products={products} services={services} methods={methods} initialTutorId={searchParams.tutorId} />
    </>
  );
}
