import { PageHeader } from "@/components/layout/PageHeader";
import { TutorForm } from "../TutorForm";

export default function NovoTutorPage() {
  return (
    <>
      <PageHeader title="Novo tutor" description="Cadastre um novo cliente" />
      <TutorForm />
    </>
  );
}
