import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { parsePermissions } from "@/lib/permissions";
import {
  asaasIsConfigured,
  createCustomer,
  createSubscription,
  listSubscriptionPayments,
  getPixQrCode,
} from "@/lib/asaas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      companyName,
      responsibleName,
      email,
      password,
      cpfCnpj,
      phone,
      billingType = "PIX",
      creditCard,
      creditCardHolderInfo,
    } = body;

    if (!email || !password || !cpfCnpj || !responsibleName) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios (Nome, E-mail, Senha e CPF/CNPJ)." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCpfCnpj = String(cpfCnpj).replace(/\D/g, "");
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
      return NextResponse.json(
        { error: "CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha de acesso deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    // 1. Verifica se usuario ja existe no banco
    let existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { tenant: true, unit: true },
    });

    let tenantId: string;
    let userId: string;
    let unitId: string | null = null;
    let userObj: any = null;

    if (existingUser) {
      if (existingUser.tenantId) {
        tenantId = existingUser.tenantId;
        userId = existingUser.id;
        unitId = existingUser.unitId;
        userObj = existingUser;
      } else {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado no sistema. Faça login para assinar." },
          { status: 400 }
        );
      }
    } else {
      // Cria novo Tenant, Unidade "Matriz" e Usuario ADMIN
      const tenant = await prisma.tenant.create({
        data: {
          companyName: companyName?.trim() || responsibleName.trim(),
          tradeName: companyName?.trim() || "BilyVet Clínica",
          responsibleName: responsibleName.trim(),
          email: cleanEmail,
          phone: cleanPhone || null,
          cnpj: cleanCpfCnpj.length === 14 ? cleanCpfCnpj : null,
          status: "ACTIVE",
        },
      });
      tenantId = tenant.id;

      const unit = await prisma.unit.create({
        data: {
          tenantId: tenant.id,
          name: "Matriz",
          phone: cleanPhone || null,
        },
      });
      unitId = unit.id;

      const passwordHash = bcrypt.hashSync(String(password), 10);
      const newUser = await prisma.user.create({
        data: {
          name: responsibleName.trim(),
          email: cleanEmail,
          passwordHash,
          role: "ADMIN",
          tenantId: tenant.id,
          unitId: unit.id,
        },
      });
      userId = newUser.id;
      userObj = newUser;
    }

    // 2. Integração Asaas
    let pixData: { encodedImage?: string; payload?: string } | null = null;
    let invoiceUrl: string | null = null;
    let bankSlipUrl: string | null = null;
    let asaasSubscriptionId: string | null = null;

    if (asaasIsConfigured()) {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      let customerId = tenant?.asaasCustomerId;

      if (!customerId) {
        const customer = await createCustomer({
          name: companyName?.trim() || responsibleName.trim(),
          email: cleanEmail,
          cpfCnpj: cleanCpfCnpj,
          phone: cleanPhone,
          mobilePhone: cleanPhone,
        });
        customerId = customer.id;
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { asaasCustomerId: customerId },
        });
      }

      // Data de vencimento = Hoje em YYYY-MM-DD
      const todayStr = new Date().toISOString().split("T")[0];

      const subInput: any = {
        customer: customerId,
        value: 197.00,
        nextDueDate: todayStr,
        cycle: "MONTHLY",
        billingType: billingType as any,
        description: "Assinatura Mensal BilyVet PRO - R$ 197,00/mês",
      };

      if (billingType === "CREDIT_CARD" && creditCard) {
        subInput.creditCard = creditCard;
        subInput.creditCardHolderInfo = creditCardHolderInfo || {
          name: responsibleName,
          email: cleanEmail,
          cpfCnpj: cleanCpfCnpj,
          phone: cleanPhone,
        };
      }

      const sub = await createSubscription(subInput);
      asaasSubscriptionId = sub.id;

      // Salva ou atualiza a assinatura localmente
      await prisma.subscription.create({
        data: {
          tenantId,
          asaasSubscriptionId: sub.id,
          plan: "PRO",
          value: 197.00,
          cycle: "MONTHLY",
          billingType: billingType,
          status: "ACTIVE",
          nextDueDate: new Date(sub.nextDueDate),
        },
      });

      // Busca a primeira fatura gerada no Asaas
      const { data: payments } = await listSubscriptionPayments(sub.id);
      const firstPayment = payments?.[0];

      if (firstPayment) {
        invoiceUrl = firstPayment.invoiceUrl || null;
        bankSlipUrl = firstPayment.bankSlipUrl || null;

        // Persiste o pagamento localmente
        await prisma.subscriptionPayment.create({
          data: {
            tenantId,
            subscriptionId: sub.id,
            asaasPaymentId: firstPayment.id,
            value: firstPayment.value,
            status: firstPayment.status,
            billingType: firstPayment.billingType,
            dueDate: new Date(firstPayment.dueDate),
            invoiceUrl: firstPayment.invoiceUrl || null,
            bankSlipUrl: firstPayment.bankSlipUrl || null,
          },
        });

        // Se for PIX, busca o QR Code Base64 e o Copia e Cola
        if (billingType === "PIX" || firstPayment.billingType === "PIX") {
          try {
            const pixInfo = await getPixQrCode(firstPayment.id);
            if (pixInfo) {
              pixData = {
                encodedImage: pixInfo.encodedImage,
                payload: pixInfo.payload,
              };
            }
          } catch (pixErr) {
            console.error("[checkout/subscribe] Erro ao buscar QR Code PIX:", pixErr);
          }
        }
      }
    }

    // 3. Efetua auto-login salvando cookie JWT de sessão
    const sessionToken = await signSession({
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      unitId: unitId,
      tenantId: tenantId,
      permissions: parsePermissions(userObj.permissions),
    });
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      ok: true,
      tenantId,
      userId,
      subscriptionId: asaasSubscriptionId,
      billingType,
      pix: pixData,
      invoiceUrl,
      bankSlipUrl,
    });
  } catch (err: any) {
    console.error("[checkout/subscribe] Erro ao processar assinatura:", err);
    return NextResponse.json(
      { error: err?.message || "Ocorreu um erro ao processar seu pedido. Tente novamente." },
      { status: 500 }
    );
  }
}
