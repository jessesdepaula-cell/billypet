import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BillingReminderPopup } from "@/components/billing/BillingReminderPopup";
import type { Role } from "@/lib/permissions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login");

  const isSuper = s.role === "SUPER_ADMIN";

  const [unit, tenant] = await Promise.all([
    s.unitId ? prisma.unit.findUnique({ where: { id: s.unitId } }) : Promise.resolve(null),
    !isSuper && s.tenantId
      ? prisma.tenant.findUnique({
          where: { id: s.tenantId },
          select: {
            id: true,
            status: true,
            subscriptions: {
              where: { status: { in: ["ACTIVE", "PENDING", "OVERDUE"] }, nextDueDate: { not: null } },
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { nextDueDate: true, value: true },
            },
          },
        })
      : Promise.resolve(null),
  ]);

  // Aviso de vencimento: pop-up quando faltarem 2 dias ou menos (inclui vencidas).
  let billingReminder: { dueDate: string; daysUntil: number; value: number | null; invoiceUrl: string | null } | null = null;
  const nextDueDate = tenant?.subscriptions?.[0]?.nextDueDate ?? null;
  if (!isSuper && s.tenantId && nextDueDate) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const due = new Date(nextDueDate);
    due.setHours(0, 0, 0, 0);
    const daysUntil = Math.round((due.getTime() - startOfToday.getTime()) / 86400000);
    if (daysUntil <= 2) {
      const pending = await prisma.subscriptionPayment.findFirst({
        where: { tenantId: s.tenantId, status: { in: ["PENDING", "OVERDUE"] } },
        orderBy: { dueDate: "asc" },
        select: { invoiceUrl: true, value: true },
      });
      billingReminder = {
        dueDate: new Date(nextDueDate).toISOString(),
        daysUntil,
        value: pending?.value ?? tenant?.subscriptions?.[0]?.value ?? null,
        invoiceUrl: pending?.invoiceUrl ?? null,
      };
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={s.role as Role} permissions={s.permissions ?? null} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar
          name={s.name}
          role={s.role as Role}
          unit={unit?.name}
          permissions={s.permissions ?? null}
          subscriptionStatus={tenant?.status ?? null}
        />
        {billingReminder && <BillingReminderPopup {...billingReminder} />}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-[1600px] w-full mx-auto flex flex-col min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
