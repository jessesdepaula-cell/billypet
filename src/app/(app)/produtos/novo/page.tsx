import { prisma } from "@/lib/db";
import { requireTenant } from "@/lib/tenant";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage() {
  const { tenantId } = await requireTenant();
  const [categories, suppliers] = await Promise.all([
    prisma.productCategory.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { tenantId, isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Novo produto" />
      <ProductForm categories={categories} suppliers={suppliers} />
    </>
  );
}
