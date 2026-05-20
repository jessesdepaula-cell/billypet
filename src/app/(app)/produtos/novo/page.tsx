import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "../ProductForm";

export default async function NovoProdutoPage() {
  const [categories, suppliers] = await Promise.all([
    prisma.productCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Novo produto" />
      <ProductForm categories={categories} suppliers={suppliers} />
    </>
  );
}
