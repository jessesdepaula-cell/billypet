import "./globals.css";
import type { Metadata } from "next";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "BilyVet - Gestão Veterinária",
  description: "Plataforma SaaS de gestão para clínicas veterinárias, hospitais, pet shops e banho e tosa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
