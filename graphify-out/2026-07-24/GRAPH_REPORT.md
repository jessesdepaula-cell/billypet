# Graph Report - C:\Users\Jesse\Desktop\PROJETOS LOVA\billypet  (2026-06-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 607 nodes · 1425 edges · 65 communities (39 shown, 26 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 101 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `requireTenantApi()` - 113 edges
2. `isTenantError()` - 112 edges
3. `requireModule()` - 73 edges
4. `BilyVet` - 43 edges
5. `PageHeader()` - 38 edges
6. `getSession()` - 32 edges
7. `isSuperAdmin()` - 23 edges
8. `fmtMoney()` - 22 edges
9. `fmtDateTime()` - 20 edges
10. `asaasIsConfigured()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `AppLayout()` --calls--> `getSession()`  [INFERRED]
  src/app/(app)/layout.tsx → src/lib/auth.ts
- `PetDetailPage()` --calls--> `requireModule()`  [INFERRED]
  src/app/(app)/pets/[id]/page.tsx → src/lib/tenant.ts
- `NovoPetPage()` --calls--> `requireModule()`  [INFERRED]
  src/app/(app)/pets/novo/page.tsx → src/lib/tenant.ts
- `ProdutoDetailPage()` --calls--> `requireModule()`  [INFERRED]
  src/app/(app)/produtos/[id]/page.tsx → src/lib/tenant.ts
- `NovoProdutoPage()` --calls--> `requireModule()`  [INFERRED]
  src/app/(app)/produtos/novo/page.tsx → src/lib/tenant.ts

## Import Cycles
- None detected.

## Communities (65 total, 26 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (52): digits(), nextDueDateISO(), LandingPage(), metadata, AssinaturasPage(), STATUS_BADGE, POST(), ClientesPage() (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (39): dependencies, bcryptjs, clsx, framer-motion, jose, jspdf, lucide-react, next (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (28): AppLayout(), Group, groups, Item, Sidebar(), AppNotification, Props, STATUS_COLOR (+20 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (19): AtendimentoPage(), ExamesPage(), FidelidadePage(), InternacaoPage(), PageHeader(), BLOCK_BYPASS_MODULES, requireModule(), TenantContext (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (33): Agenda Module, App Mobile para Tutores, BilyVet, Cadastros Module, Esteira Module, Estoque Module, Exames Module, Fidelidade Module (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (17): PATCH(), POST(), GET(), POST(), DELETE(), GET(), GET(), POST() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): GET(), POST(), POST(), GET(), isTenantError(), POST(), DELETE(), PATCH() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (18): AppointmentStatus, AppointmentStatusManager(), Collaborator, CollaboratorsManager(), ServiceOpt, UserOpt, ConfiguracoesPage(), DoseTemplate (+10 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (14): CategoriesBar(), COLORS, PaymentMixPie(), RevenueLine(), DashboardPage(), FinanceiroPage(), requireTenant(), cn() (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (12): AtendimentoActions(), AtendimentoActionsProps, PetDetailPage(), PetProfileClient(), PetProfileClientProps, ProtocolTemplate, TutorOpt, ageFromBirth() (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.23
Nodes (11): getAppUrl(), POST(), passwordResetEmail(), sendEmail(), SendEmailInput, GET(), ALLOWED_ROLES, GET() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (12): ActivateForm(), maskCnpj(), maskPhone(), maskZip(), Props, AssinaturaPage(), brl(), fmtDate() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (7): CashActions(), CaixaPage(), ReceivableActions(), ContasReceberPage(), ReceiveClient(), InventarioPage(), fmtMoney()

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (10): GET(), POST(), syncCollaborators(), AppointmentForm(), Collaborator, Pet, Service, StatusOpt (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.24
Nodes (10): getTutorial(), sortedTutorials(), Tutorial, TUTORIALS, tutorialsByCategory(), TutorialSection, TutorialStep, TutorialDetalhePage() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (7): InternacaoActions(), AtendimentoDetailPage(), InternacaoDetailPage(), TutorDetailPage(), PipelineSelect(), StatusOpt, fmtDateTime()

### Community 17 - "Community 17"
Cohesion: 0.27
Nodes (6): ProdutoDetailPage(), globalForPrisma, NovoProdutoPage(), Opt, Product, ProductForm()

### Community 18 - "Community 18"
Cohesion: 0.38
Nodes (3): PayableActions(), ContasPagarPage(), PayClient()

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (4): Card, EsteiraBoard(), StatusOpt, EsteiraPage()

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (5): ALLOWED_ROLES, sanitizePermissions(), ALL_MODULE_SLUGS, DELETE(), PATCH()

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (5): Item, Method, Product, Service, Tutor

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): NovoPetPage(), Pet, PetForm(), TutorOpt

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (3): config, PUBLIC, PUBLIC_API_PREFIXES

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): buildCommand, framework, installCommand, $schema

### Community 25 - "Community 25"
Cohesion: 0.83
Nodes (3): addDays(), AgendaPage(), startOfWeek()

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (3): Exam, ExamsClient(), STATUSES

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): MedicalRecordForm(), MR, Prescription

### Community 29 - "Community 29"
Cohesion: 0.83
Nodes (3): fetchOwned(), DELETE(), PATCH()

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (3): ensureSuperAdmin(), main(), prisma

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (4): Autenticação JWT, HTTP-only cookies, jose, JWT

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (4): Prisma ORM, prisma/schema.prisma, prisma/seed.ts, SQLite

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (3): Atendimento Module, jsPDF, Receituário PDF

## Knowledge Gaps
- **178 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `description` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `requireModule()` connect `Community 3` to `Community 33`, `Community 2`, `Community 34`, `Community 7`, `Community 8`, `Community 10`, `Community 12`, `Community 13`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 22`, `Community 25`, `Community 26`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `requireTenantApi()` connect `Community 5` to `Community 0`, `Community 3`, `Community 6`, `Community 11`, `Community 14`, `Community 20`, `Community 29`, `Community 37`, `Community 38`, `Community 40`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 59`, `Community 64`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `isTenantError()` connect `Community 6` to `Community 0`, `Community 3`, `Community 5`, `Community 11`, `Community 14`, `Community 20`, `Community 29`, `Community 37`, `Community 38`, `Community 40`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 47`, `Community 48`, `Community 49`, `Community 50`, `Community 51`, `Community 52`, `Community 59`, `Community 64`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 30 inferred relationships involving `requireTenantApi()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`requireTenantApi()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `isTenantError()` (e.g. with `GET()` and `DELETE()`) actually correct?**
  _`isTenantError()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `requireModule()` (e.g. with `AtendimentoDetailPage()` and `InternacaoDetailPage()`) actually correct?**
  _`requireModule()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._