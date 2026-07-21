import { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout BilyVet — Assinatura do Sistema de Gestão Veterinária",
  description:
    "Assine o BilyVet por R$ 197,00/mês com acesso imediato a todas as funcionalidades de atendimento, agenda, estoque, financeiro e IA no WhatsApp.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
