# ObraRentable OS — Product Spec

> Status: living draft. Documentation only. Authoritative for the construction vertical's user-facing product. Does not replace the LocalOps modular architecture, which remains the foundation. Pharma and Dental architecture stays available but is not visible in the ObraRentable MVP.

## 1. Product positioning

**ObraRentable OS** is a simple, automated financial/admin platform for tradespeople and micro renovation businesses. It helps small trades pros — electricians, plumbers, painters, installers, carpenters, maintenance technicians and small reformistas — manage trabajos/obras, presupuestos, facturas emitidas, gastos, tickets/facturas de proveedor, cobros, reports mensuales y paquetes para el gestor desde un solo sitio.

It is **not** an enterprise construction ERP and **not** a generic CRM. It is the **financial/admin cockpit for small trades businesses**.

> **Core promise:** "Menos Excel, menos papeles, menos olvidos. Trabajos, presupuestos, facturas, gastos, cobros y reports para tu gestor en una sola app."

### Tone

- Mobile-first. Cockpit del trabajo activo primero, vistas multi-trabajo en segundo plano.
- White / light-gray UI con un azul fuerte como primario, texto navy.
- Lenguaje de oficio, no enterprise. Cero jerga consultora.
- Hablar de "trabajos", "obras", "facturas", "cobros", "gastos", "tickets" — no de "projects", "deals", "pipelines" ni "opportunities".

### Naming

- Product brand (visible to user): **ObraRentable OS**.
- Internal vertical key (code): `construction`.
- Internal commercial name in registry (`lib/verticals/construction.ts`): `ReformOps`. Mantenido por simetría con DentalOps/PharmaOps.

## 2. Target customer

**Quién:** profesionales solos y micro-empresas de **1–5 personas** en oficios y reformas pequeñas. No medianas constructoras.

**Perfiles primarios:**
- Reformistas pequeños (1–4 trabajadores).
- Electricistas autónomos o con un ayudante.
- Fontaneros autónomos o pequeñas empresas.
- Pintores autónomos.
- Instaladores (climatización, gas, telecomunicaciones).
- Carpinteros autónomos.
- Técnicos de mantenimiento.
- Autónomos de oficios en general.

**Cómo gestionan hoy (typical stack):**
- WhatsApp con clientes y proveedores.
- Notas en papel, libreta de obra.
- Fotos de tickets y albaranes en el carrete del móvil.
- Excel improvisado con presupuestos y cuentas.
- Plantilla Word/Excel para facturas.
- Carpetas físicas con albaranes y facturas.
- Gestor o gestoría que prepara los modelos fiscales con lo que el autónomo le mande cada mes/trimestre.
- Papeleo mensual hecho a mano y a última hora.

**Lo que les duele:**
- Tickets que se pierden o se difuminan en el carrete.
- No saber si una obra está dando margen hasta el final.
- Olvidar cobros y facturar tarde.
- Llegar al cierre del trimestre y no tener los papeles ordenados para el gestor.
- Mantener un Excel paralelo "para entender el negocio" que nunca cuadra con la realidad.

**Lo que NO son:** constructoras medianas con varias obras simultáneas, planificación de recursos, contabilidad analítica industrial. Para ese segmento ya existen ERPs.

## 3. Use cases by trade

Los flujos son comunes — lo que cambia es el vocabulario y el peso relativo de cada módulo. La app debe sentirse natural en todos ellos.

### Electricista autónomo
- Múltiples **trabajos cortos** al día/semana (instalaciones, averías, reformas eléctricas).
- Foto del ticket de tienda eléctrica → asignar a un trabajo en 10 segundos.
- Factura simple al cliente al terminar; cobro en transferencia o Bizum.
- Margen importa por trabajo, pero también el volumen mensual.
- Output gestor: facturas emitidas + tickets/facturas proveedor del mes.

### Fontanero autónomo / pequeña empresa
- Mezcla de **urgencias** (1 visita) y **reformas** (1–2 semanas).
- Materiales caros y variables por trabajo (calderas, calentadores, sanitarios).
- Necesita controlar margen real de la urgencia (mano de obra alta, material concreto).
- Cobros: efectivo, Bizum, transferencia.

### Pintor autónomo
- **Trabajos por obra completa** con presupuesto por m² o por estancias.
- Material homogéneo (pintura, masilla, cintas).
- Margen depende mucho de la mano de obra.
- Necesita facturas correctas para particulares (deducción IRPF cliente) y comunidades de propietarios.

### Pequeño reformista (1–4 trabajadores)
- Una **obra principal activa** + 2–4 presupuestos abiertos + algún trabajo recién terminado pendiente de cobro final.
- Cobros por **fases** (anticipo, avances, final de obra).
- Múltiples proveedores y categorías (material, mano de obra, subcontratas).
- Cockpit de obra es el caso más completo del producto.

### Instalador / técnico de mantenimiento
- Mezcla de **contratos recurrentes** y **trabajos puntuales**.
- Tickets de proveedor pequeños y frecuentes.
- Reports mensuales claros para el gestor son lo que más le ahorra tiempo.

### Carpintero autónomo
- Pocos trabajos pero **alto valor**.
- Material específico (tableros, herrajes) con plazos de pedido.
- Margen sensible a la cotización del material.

En todos los oficios el output recurrente es el mismo: **paquete mensual limpio para el gestor con facturas emitidas, gastos confirmados, cobros y resumen de IVA**.

## 4. Core workflows

Estos son los flujos diarios que la app debe hacer fluidos. Funcionan con datos mock/session-store mientras no exista backend.

| # | Workflow | Estado actual | Notas |
|---|---|---|---|
| 1 | **Crear trabajo / obra** | Implementado | Form en `/projects/new`, redirige al detalle. |
| 2 | **Generar presupuesto** | Parcial | El presupuesto vive como campo del trabajo (`presupuestoTotal`). Estimate-document avanzado en Phase posterior. |
| 3 | **Añadir gasto** | Implementado | Form por trabajo, suma al margen real en vivo. |
| 4 | **Escanear/subir ticket (placeholder)** | UI lista, sin OCR real | Foto/voz son placeholders con copy "Disponible más adelante con créditos IA". |
| 5 | **Emitir factura** | Próxima iteración | `ConstructionInvoice` ampliado + flujo de creación + listado. |
| 6 | **Registrar cobro** | Implementado | Form por trabajo. Métodos: transferencia, efectivo, Bizum, tarjeta, otro. |
| 7 | **Ver rentabilidad por trabajo** | Implementado parcial | Cockpit de trabajo activo + tile global. Vista comparativa cross-trabajo (`/rentabilidad`) pendiente. |
| 8 | **Generar report mensual** | Próxima iteración | Resumen mensual: facturado, cobrado, gastos, IVA repercutido/soportado, margen del mes. |
| 9 | **Exportar paquete para gestor** | Próxima iteración | CSV/PDF mock con facturas emitidas, gastos, cobros, IVA — descarga generada en cliente. |

## 5. MVP modules

| Módulo | Ruta base | Estado | Resumen |
|---|---|---|---|
| Inicio (cockpit) | `/dashboard` | ✅ | Hero "Trabajo activo" con CTAs primarios + alertas + resumen del negocio + otros trabajos. |
| Trabajos / Obras | `/verticals/construction/projects` | ✅ | Listado con filtros Todas/Activas/Finalizadas. |
| Detalle de trabajo | `/verticals/construction/projects/[id]` | ✅ | Header + métricas + progress + tabs (Resumen / Gastos / Cobros / Extras / **Facturas** próximamente). |
| Crear trabajo | `/verticals/construction/projects/new` | ✅ | Formulario con vista previa de margen. |
| Presupuestos | (compartido con Trabajos) | Parcial | Hoy vive como campo `presupuestoTotal`. Documento separado en Phase 4. |
| Gastos | dentro de detalle de trabajo | ✅ | Lista por trabajo + totales por categoría. |
| Tickets / facturas proveedor | `/verticals/construction/tickets` | ✅ | Listado + asignar/rechazar. OCR mock. |
| **Facturas emitidas** | `/verticals/construction/invoices` | Próximo | Listado de facturas a cliente, filtros por estado y mes. |
| **Crear factura** | `/verticals/construction/invoices/new` o `/projects/[id]/invoices/new` | Próximo | Form con base imponible, IVA, total. |
| Cobros | `/verticals/construction/payments` | ✅ | Cobros pendientes cross-trabajo. |
| **Reports mensuales** | `/verticals/construction/reports` | Próximo | Resumen de facturación, gastos, IVA y margen del mes. |
| **Gestor / exportación** | `/verticals/construction/export` | Próximo | Paquete descargable (CSV mock) con facturas, gastos, cobros, IVA. |
| Rentabilidad | `/verticals/construction/rentabilidad` | Pendiente | Vista cross-trabajo para ranking/alertas. |
| Ajustes empresa | `/verticals/construction/ajustes` | Pendiente | Datos fiscales, IVA por defecto, numeración de facturas, categorías. |

### Status colors
- `healthy` — verde (margen ≥ 20%, cobro al día, factura cobrada).
- `pending` — amarillo (margen 5–20%, cobro próximo a vencer, factura emitida o enviada sin cobrar).
- `risk` — rojo (margen < 5% o negativo, cobro vencido, factura vencida).
- `neutral` — gris (sin datos, archivado, borrador).

Mapped to Tailwind tokens: `rentable.healthy/healthyBg`, `rentable.pending/pendingBg`, `rentable.risk/riskBg`, `rentable.neutral/neutralBg`.

## 6. UX principles

1. **Mobile-first siempre.** El usuario está en obra con el móvil sucio. La pantalla principal tiene que ser legible con una mano y un dedo.
2. **Un solo trabajo activo en primer plano.** El cockpit prioriza el trabajo principal del día. Multi-trabajo existe pero queda en segundo plano (listas más abajo, "Otros trabajos").
3. **Claridad financiera por encima de funcionalidad CRM.** Cero pipeline visual, cero kanban, cero "deals". Importa cuánto entra, cuánto sale, cuánto queda por cobrar.
4. **Cierre mensual sin estrés.** Cada acción del día deja el material listo para el report mensual y el paquete del gestor. El cierre es un click, no una migración Excel.
5. **Lenguaje de oficio.** "Trabajo", "obra", "albarán", "ticket", "factura", "cobro", "fianza", "anticipo", "fase", "extra". Nunca "lead", "deal", "opportunity", "pipeline", "stakeholder".
6. **Mocks honestos.** Los placeholders dicen claramente que son placeholders ("Disponible más adelante con créditos IA"). No prometemos lo que no hace todavía.
7. **El gestor es nuestro aliado, no nuestro enemigo.** Cada export está pensado para que el gestor lo cargue sin pelearse con el formato. La app no presume de "sustituye al gestor"; presume de hacer su trabajo más rápido.

## 7. Data model

Todos los entities llevan `organizationId` para futuro multi-tenant.

### Already in the platform
- `ConstructionProject` (= trabajo/obra). Campos clave: `presupuestoTotal`, `presupuestoVatRate`, `estimatedMaterialCost/LaborCost`, `actualMaterialCost/LaborCost`, `obraType`, `notes`. Campo `budget` legado preservado.
- `ConstructionEstimate` y `ConstructionEstimateItem` — documento de presupuesto formal multi-línea (advanced flow).
- `ConstructionInvoice` (legacy mínimo, en `types/construction.ts`). **Próxima iteración**: ampliar para el flujo real de facturas emitidas (ver más abajo).
- `ConstructionPayment` — cobros con `phase` y `method`.
- `ConstructionExpense` — gastos con categoría, IVA, fuente (manual/ticket/voice).
- `ConstructionTicket` — comprobante físico/foto cargada con `extractedFields` mock.
- `Contact` — clientes y proveedores.

### To add (próximas iteraciones)

#### `ConstructionInvoice` ampliado (factura emitida — slice próximo)
Campos:
- `id`, `organizationId`, `projectId`, `contactId`
- `number` (string — numeración configurable por organización)
- `issueDate`, `dueDate?`
- `concept`
- `subtotal` (base imponible)
- `vatRate`, `vatAmount`
- `total`
- `status`: `"draft" | "issued" | "sent" | "paid" | "overdue" | "cancelled"`
  - UI labels ES: borrador / emitida / enviada / cobrada / vencida / anulada
- `paidAt?`
- `notes?`

Relación con `ConstructionPayment`: una factura emitida puede tener uno o varios cobros asociados. En el MVP la unión se mantiene **lógica** (mismo concepto/fase), no por foreign key.

#### `ConstructionExtra` (trabajos fuera de presupuesto)
- `id`, `organizationId`, `projectId`
- `description`, `amount`, `acceptedAt?`
- `status`: `"proposed" | "accepted" | "invoiced" | "rejected"`
- Cuando `accepted`, eleva el `presupuestoTotal` efectivo.

#### `MonthlyFinancialReport` (report mensual)
- `id`, `organizationId`, `period` (`YYYY-MM`)
- `invoicedTotal`, `invoicedVatTotal`
- `collectedTotal`
- `expensesTotal`, `expensesVatTotal`
- `marginAmount`, `marginPercent`
- `byProject`: array `{ projectId, invoiced, collected, expenses, margin }`
- `generatedAt`

Resumen derivado, no necesariamente persistido — recomputable en cliente desde invoices/expenses/payments.

#### `ManagerExportPackage` (paquete para gestor)
- `id`, `organizationId`, `period`
- `invoicesCsvUrl`, `expensesCsvUrl`, `paymentsCsvUrl`
- `summaryPdfUrl`
- `notes?`
- `generatedAt`

En el MVP, los `csvUrl`/`pdfUrl` son blobs generados en cliente y descargados al instante. Sin almacenamiento backend.

### Source of truth for margin/progress
- Presupuesto = `project.presupuestoTotal` (con fallback a `project.budget`).
- Costes = preferentemente la suma de `ConstructionExpense` no rechazados; fallback a `actualMaterialCost + actualLaborCost`.
- Cobrado = suma de `ConstructionPayment` con `status = "paid"`.
- Pendiente = `ConstructionPayment` con `status in ("pending","overdue")`.
- Facturado (próximo) = `ConstructionInvoice.total` con `status in ("issued","sent","paid","overdue")`.
- IVA repercutido (próximo) = `ConstructionInvoice.vatAmount` cobrados (criterio de caja MVP).
- IVA soportado = `ConstructionExpense.vatAmount` confirmados.

## 8. Calculation rules

Implemented in `lib/construction/obraMath.ts` y `lib/construction/estimateMath.ts`.

### Trabajo / obra
- `presupuestoTotal = project.presupuestoTotal ?? project.budget ?? 0`.
- `actualMaterialCost`/`actualLaborCost` derivados de `expenses` confirmados; fallback a campos del proyecto.
- `marginAmountActual = presupuestoTotal − costToDate`.
- `marginPercentActual = marginAmountActual / presupuestoTotal`.
- `status` umbrales: healthy ≥ 0.20, warning ≥ 0.05, loss < 0.05.

### Cobros
- `paid`, `pending`, `overdue` agrupados por `status`.
- `collectedPercent = paid / presupuestoTotal`.

### Gastos
- `expenseTotalsByProject` — totales por categoría + bucket material/labor + IVA acumulado.

### Facturación (próximo)
- `invoiceTotalsByProject(projectId, invoices)` → `{ count, total, paid, pending, overdue, byStatus, vatTotal }`.
- `monthlyInvoiceTotals(invoices, yearMonth?)` → resumen por mes.
- `vatCollectedFromInvoices(invoices, since?)` → IVA repercutido en facturas cobradas.
- `unpaidInvoicesTotal(invoices)` → `{ count, total }` para `status in (issued, sent, overdue)`.

### Reglas globales
- Importes en EUR. `formatEUR`/`formatEURPrecise` con `Intl.NumberFormat("es-ES", ...)`.
- IVA por defecto 21% (configurable en Ajustes).
- Numeración de facturas: por defecto `YYYY/NNN` con contador en sesión. Configurable en Ajustes.

## 9. Route map

```
/                                                Landing LocalOps (menciona ObraRentable OS)
/onboarding                                      Tile de construction muestra "ObraRentable OS"
/dashboard                                       ObraRentable Inicio (cockpit trabajo activo)          ✅
/verticals/construction                          Legacy ReformOps Dashboard                            ✅
/verticals/construction/projects                 Listado trabajos                                      ✅
/verticals/construction/projects/new             Crear trabajo                                         ✅
/verticals/construction/projects/[id]            Detalle trabajo                                       ✅
/verticals/construction/projects/[id]/expenses/new       Añadir gasto                                  ✅
/verticals/construction/projects/[id]/payments/new       Registrar cobro                               ✅
/verticals/construction/projects/[id]/invoices/new       Emitir factura para este trabajo              Próximo
/verticals/construction/projects/[id]/extras             Lista de extras                               Pendiente
/verticals/construction/payments                 Cobros pendientes (cross-trabajo)                     ✅
/verticals/construction/tickets                  Tickets pendientes (cross-trabajo)                    ✅
/verticals/construction/invoices                 Facturas emitidas (cross-trabajo)                     Próximo
/verticals/construction/invoices/new             Emitir factura desde lista                            Próximo
/verticals/construction/reports                  Reports mensuales                                     Próximo
/verticals/construction/export                   Paquete para gestor                                   Próximo
/verticals/construction/rentabilidad             Rentabilidad cross-trabajo                            Pendiente
/verticals/construction/ajustes                  Ajustes empresa/IVA/numeración                        Pendiente
/verticals/construction/estimates                Estimate document (advanced)                          Phase 4
/verticals/construction/estimate-builder         Estimate builder advanced                             Phase 4
```

## 10. Component map

### Shared shell (LocalOps, sin tocar)
- `components/shell/AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `MobileNav.tsx`, `OrganizationSwitcher.tsx`, `VerticalSwitcher.tsx`.

### UI primitives
- `components/ui/{Button,Card,Badge,Input,Select,Tabs,Table,Field,MoneyField,SegmentedControl,Textarea}.tsx`.

### ObraRentable-specific (`components/verticals/construction/`)
- Cockpit: `ActiveObraHero.tsx`, `InicioDashboard.tsx`, `DemoResetCard.tsx`.
- Trabajos: `ObrasFilterableList.tsx`, `ObrasHeader.tsx`, `ObraCard.tsx`, `ObraStatusBadge.tsx`.
- Detalle: `ObraDetailClient.tsx`, `ObraDetailHeader.tsx`, `ObraDetailTabs.tsx`.
- Cobros: `CobrosPendientesView.tsx`, `CobrosPendientesList.tsx`.
- Tickets: `TicketsView.tsx`, `TicketsList.tsx`.
- Forms: `forms/{ProjectForm,ExpenseForm,ExpenseFormView,PaymentForm,PaymentFormView,SubmittedCard}.tsx`.
- **Próximos**: `forms/InvoiceForm.tsx`, `forms/InvoiceFormView.tsx`, `InvoicesList.tsx`, `InvoicesView.tsx`, `MonthlyReportView.tsx`, `ExportPackageView.tsx`.
- Visualización financiera: `MetricTile.tsx`, `MarginPill.tsx`, `ProgressBar.tsx`, `QuickActionTile.tsx`, `AlertCard.tsx`, `icons.tsx`.

### Legacy / document flow
- `ConstructionDashboard`, `ProjectList`, `EstimateBuilder`, `EstimatePreview`, `MarginSummary`, `PaymentStatusCard`. Mantenidos para `/verticals/construction` y la rama estimate-document.

## 11. Phase plan

### ✅ Steps 0–4 — Foundation, brand, MVP UI, session store, cockpit
- Domain types, mock data, helpers, tokens.
- Brand surfacing.
- Inicio + Trabajos + Detalle + Crear + Añadir gasto + Registrar cobro.
- ConstructionExpense + Tickets pendientes + Cobros pendientes.
- Session store con sessionStorage hydration. Forms escriben al store. Reset demo.
- Cockpit de trabajo activo en Inicio (single-job mental model).

### 🔜 Step 5 — Facturas emitidas
- `ConstructionInvoice` ampliado y mockeado.
- Store: `invoices`, `createInvoice`, hooks `useInvoices`/`useInvoicesByProject`.
- Helpers: `invoiceTotalsByProject`, `monthlyInvoiceTotals`, `vatCollectedFromInvoices`, `unpaidInvoicesTotal`.
- Rutas `/invoices`, `/invoices/new`, `/projects/[id]/invoices/new`.
- Tab "Facturas" en detalle de trabajo.
- Dashboard: alerta facturas pendientes + quick action "Emitir factura".

### Step 6 — Reports mensuales y exportación gestor
- Vista `/reports`: resumen del mes (facturado, cobrado, gastos, IVA, margen) + comparativa con mes anterior.
- Vista `/export`: paquete descargable con CSV de facturas/gastos/cobros + PDF mock de resumen + nota al gestor. Generado en cliente.
- Numeración de facturas configurable.

### Step 7 — Extras, rentabilidad cross-trabajo, ajustes
- `ConstructionExtra` + flujo de aceptación.
- Vista `/rentabilidad` con ranking de trabajos y alertas.
- Vista `/ajustes`: datos fiscales, IVA por defecto, numeración, categorías custom.

### Step 8 — Estimate document flow (advanced)
- Estimate builder interactivo con líneas live + preview imprimible.
- Aceptar estimate alimenta `presupuestoTotal` y opcionalmente factura borrador.

### Step 9 — Real backend (out of MVP)
- Supabase Auth + RLS.
- Repositorios sustituyen mocks/sessionStore.
- OCR/IA reales detrás de feature flags + créditos.
- **Sin** contabilidad doble entrada. **Sin** presentación fiscal automatizada. **Sin** conciliación bancaria automática. **Sin** e-invoicing legal.

## 12. What should remain mocked

Hasta autorización explícita:

- **Auth.** Hardcoded `org-demo`.
- **Persistencia.** Session store en memoria + `sessionStorage`. Sin Supabase.
- **OCR de tickets.** Captura por foto/voz son placeholders. `extractedFields.confidence` simulado.
- **AI.** Sin llamadas a proveedores. `lib/ai/actions.ts` enumera acciones futuras con coste en créditos.
- **Pagos.** Sin Stripe/SEPA/Bizum API. "Registrar cobro" crea un `ConstructionPayment` mock.
- **Facturación legal.** Las facturas emitidas son documentos administrativos del cockpit. **No constituyen facturación oficial** ni reemplazan el sistema del gestor. Sin numeración legal validada, sin firma digital, sin e-invoicing.
- **Presentación fiscal.** Cero. Modelos 303/130/115/etc. no se generan ni presentan. El gestor sigue siendo responsable.
- **Conciliación bancaria.** No automatizada. La marcación "cobrado" es manual.
- **Integraciones gestor.** Sin export directo a Sage/A3/Holded; sólo CSV/PDF mock en cliente.
- **CSV/PDF export.** Generado en cliente desde mocks.

## 13. Boundaries (lo que NO somos)

- ❌ **ERP industrial / multi-proyecto**. Si el usuario tiene >5 personas y obras simultáneas con planificación de recursos, no somos su producto.
- ❌ **CRM genérico** (HubSpot, Pipedrive). Sin pipelines, sin scoring de leads, sin marketing automation. Hablamos de trabajos, no de "deals".
- ❌ **Software de contabilidad oficial.** No hay libro diario, ni asientos, ni doble partida.
- ❌ **Presentación fiscal.** No generamos modelos AEAT (303/130/115/390/...) ni los presentamos.
- ❌ **E-invoicing legal** (Verifactu / TicketBAI / FacturaE). El paquete es administrativo, no fiscal.
- ❌ **Conciliación bancaria** automatizada.
- ❌ **OCR / IA real** todavía.
- ❌ **Integración real con gestor** (Sage, A3, Holded API). Sólo export descargable.
- ❌ **Reemplazo del gestor.** El gestor revisa y presenta los modelos. ObraRentable produce material limpio para que su trabajo sea más rápido.

## 14. Next implementation recommendation

**Inmediato — Step 5 (facturas emitidas):**
1. Tipo `ConstructionInvoice` ampliado en `types/construction.ts`.
2. Mock invoices en `lib/mock/construction.ts`.
3. Session store: `invoices`, `createInvoice`, `useInvoices`, `useInvoicesByProject`.
4. Helpers en `obraMath.ts`: `invoiceTotalsByProject`, `monthlyInvoiceTotals`, `vatCollectedFromInvoices`, `unpaidInvoicesTotal`.
5. Componentes: `InvoiceForm`, `InvoiceFormView`, `InvoicesList`, `InvoicesView`.
6. Rutas: `/invoices`, `/invoices/new`, `/projects/[id]/invoices/new`.
7. Detalle de trabajo: tab "Facturas" con totales emitidos/cobrados/pendientes.
8. Dashboard: alert "Facturas pendientes" + quick action "Emitir factura".

**Después — Step 6 (reports + exportación gestor):**
1. `MonthlyFinancialReport` derivado.
2. Vista `/reports` con resumen del mes y comparativa.
3. `ManagerExportPackage` con CSV/PDF mock generados en cliente.
4. Numeración de facturas configurable.

**Más adelante — Step 7 (extras + rentabilidad + ajustes):**
1. `ConstructionExtra` con flujo de aceptación.
2. `/rentabilidad` cross-trabajo.
3. `/ajustes` empresa.
