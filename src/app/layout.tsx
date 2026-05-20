import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BillyPet - Gestao Veterinaria",
  description: "Plataforma SaaS de gestao para clinicas veterinarias, hospitais, pet shops e banho e tosa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
