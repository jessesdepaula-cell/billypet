import { PageHeader } from "@/components/layout/PageHeader";
import { TutorForm } from "../TutorForm";
import { requireModule } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function NovoTutorPage() {
  await requireModule("tutores");
  return (
    <>
      <PageHeader title="Novo tutor" description="Cadastre um novo cliente" />
      <TutorForm />
    </>
  );
}
