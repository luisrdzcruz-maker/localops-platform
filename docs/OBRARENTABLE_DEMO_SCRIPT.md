# ObraRentable OS — Demo Script

> Sales/demo readiness guide for showing the local MVP to partners, advisors and pilot tradespeople. Pairs with `docs/OBRARENTABLE_PRODUCT_SPEC.md`.

## 1. Product one-liner

**ObraRentable OS** — el cockpit financiero/administrativo para autónomos de oficios y micro-negocios de reformas. Trabajos, presupuestos, facturas, gastos, cobros y reports para tu gestor en una sola app.

## 2. Target customer

Autónomos y micro-empresas de **1–5 personas** en oficios y reformas pequeñas:

- Reformistas pequeños.
- Electricistas autónomos.
- Fontaneros.
- Pintores.
- Instaladores (clima, gas, telecom).
- Carpinteros.
- Técnicos de mantenimiento.
- Equipos de oficio con un par de empleados.

No es para constructoras medianas con planificación industrial.

## 3. Problem statement (uno solo, claro)

> "Llevas tu negocio entre WhatsApp, fotos del carrete, una libreta y un Excel improvisado. Cuando llega fin de mes y el gestor pide papeles, te pasas un fin de semana ordenando facturas, tickets y cobros, y nunca sabes con seguridad si la obra de turno te está dando margen o no."

Los síntomas:
- Tickets que se pierden.
- Cobros olvidados.
- Facturas que se emiten tarde.
- Excels paralelos que nunca cuadran.
- Cierre de mes/trimestre apurado y a mano.
- No saber el margen real hasta que la obra termina.

## 4. Demo story

> "Mira, esta app está pensada para alguien como tú: que tiene una obra activa ahora mismo, dos presupuestos abiertos, un par de cobros que tienes que perseguir y tickets de proveedor en el carrete. La idea es que cada vez que entres por la mañana, en 30 segundos sepas dónde estás. Y a fin de mes, mandes un paquete limpio al gestor con un click. Te lo enseño con datos demo."

Tono:
- Cercano, sin jerga.
- Hablar de "trabajos", "obras", "facturas", "tickets", "cobros". Nunca "leads", "deals", "pipeline".
- Insistir en que **el gestor sigue siendo el responsable** de la presentación fiscal. Esta app le ahorra trabajo, no le sustituye.
- Mantener el ritmo: cada pantalla = una decisión clara.

## 5. Demo paths

---

### 5A. Demo rápido — 5 minutos (WhatsApp / primera llamada / pasillo)

Objetivo: que el interlocutor entienda **qué hace** la app y quiera ver más. No enseñes todo. Enseña el momento "¡esto sí me serviría a mí!".

| Tiempo | Pantalla | Qué haces |
|---|---|---|
| 0:00 – 1:00 | Inicio `/dashboard` | Muestra la tarjeta de obra activa con métricas. Di: "Esto es lo primero que ves cada mañana." |
| 1:00 – 2:30 | Detalle de obra (clic en "Ver obra") | Muestra la barra de presupuesto. Di: "Ves en un segundo si vas a pasarte de presupuesto antes de que pase." |
| 2:30 – 3:30 | Añadir gasto (desde el hero) | Rellena el form en directo: 380€, material fontanería, IVA 21%. Di: "Del proveedor a la app en 10 segundos." |
| 3:30 – 4:30 | Informes `/reports` | Muestra el resumen del mes: facturado, cobrado, IVA, margen. Di: "Esto es lo que mandas al gestor a fin de mes." |
| 4:30 – 5:00 | Cierre | Di: "¿Tiene sentido para tu día a día? Si quieres, en 10 minutos te enseño el flujo completo con facturas y cobros." |

**Clave del pitch de 5 min:** problema → solución → número concreto. No hagas scroll ni expliques cada campo.

---

### 5B. Demo completo — 12 minutos (reunión / videollamada / café)

Objetivo: que el interlocutor **se vea usándola** y tenga ganas de ser piloto. Sigue los pasos en orden. No improvises.

### Step 1 — Inicio (`/dashboard`)

**Mostrar:** la "Obra activa" como tarjeta dominante en la parte superior. Métricas pequeñas (Presupuesto / Gastos / Cobrado / Margen). Avisos abajo (cobros vencidos, tickets pendientes).

**Decir:**
> "Esto es lo primero que ves. La obra que tienes entre manos arriba, con los números que te importan: cuánto presupuestaste, cuánto has gastado, cuánto has cobrado y qué margen llevas. Si algo va mal, te avisa."

**Acentuar:** una sola obra en primer plano. Multi-obra existe, pero no domina.

### Step 2 — Obra activa: detalle (clic en "Ver obra")

**Mostrar:** header con cliente, estado, métricas, barra de uso del presupuesto, tabs (Resumen / Gastos / Cobros / Extras).

**Decir:**
> "Aquí tienes el detalle. Mira la barra: ya has gastado el 70% del presupuesto. Si te pasas, se pone roja antes de que sea tarde."

### Step 3 — Añadir gasto (CTA "Añadir gasto" en el hero o desde la obra)

**Mostrar:** form simple. Demo: añadir un gasto de 380€ "Material fontanería" con IVA 21%.

**Decir:**
> "Esto es lo que harías al volver del proveedor. Categoría, importe, IVA, listo. Al guardarlo verás el margen recalcularse en directo."

**Acentuar:** la vista previa muestra cómo cambia el margen al introducir el importe. *"Cada gasto cambia tu margen."*

### Step 4 — Registrar cobro

**Mostrar:** form con fase, importe, fecha, método (transferencia / Bizum / efectivo / etc.).

**Decir:**
> "El cliente te ha pagado el avance del 50%. Lo registras aquí en 5 segundos. La pantalla principal y los cobros pendientes se actualizan al instante."

### Step 5 — Emitir factura *(si la slice está implementada)*

**Mostrar:** lista de facturas (`/invoices`), nueva factura (`/invoices/new`).

**Decir:**
> "Cuando termines la fase, emites la factura desde aquí. Número, IVA, base imponible, listo. Aún no genera PDF real ni la manda por email — eso viene en la siguiente versión — pero la guardas y se cuenta en el report del mes."

> ⚠️ *Si la slice de invoices todavía no está conectada en producción demo, saltar este paso y avisar: "Las facturas las estamos cerrando esta semana en la build de demo."*

### Step 6 — Tickets pendientes (`/verticals/construction/tickets`)

**Mostrar:** lista de tickets con thumbnails, sugerencia de obra, botón Asignar.

**Decir:**
> "Aquí van todos los tickets que vas haciendo foto durante el día. Por ahora la captura por foto y el OCR son simulados — ahí entra IA con créditos en la siguiente versión —, pero ya ves cómo será. Le das a Asignar y se va a la obra correcta como gasto."

**Acentuar:** "OCR/IA simulado en este MVP. En producción usaría créditos y límites."

### Step 7 — Reports mensuales *(si la slice está implementada)*

**Mostrar:** `/reports`. Resumen del mes: facturado, cobrado, gastos, IVA repercutido vs soportado, margen.

**Decir:**
> "Esto es lo que te ahorra el fin de semana de papeles. Cada mes ves un resumen claro: lo que has facturado, lo que has cobrado, los gastos confirmados y un IVA orientativo. Tu gestor lo valida, tú no peleas con Excel."

> ⚠️ *Si la slice de reports todavía no está conectada, mostrar la sección "Resumen del negocio" del Inicio como sustituto y decir: "El report mensual completo lo terminamos esta semana."*

### Step 8 — Gestor / exportación *(si la slice está implementada)*

**Mostrar:** `/export`. Checklist: facturas incluidas, gastos, tickets, cobros, IVA, rentabilidad. Botones Exportar ZIP / Enviar por email (deshabilitados con copy "Exportación simulada").

**Decir:**
> "Y al final del mes, todo esto en un paquete listo para tu gestor. Hoy es simulado: cuando salgamos a producción exporta CSV de facturas, gastos, cobros y un PDF con el resumen del mes. Tu gestor lo carga directamente."

**Tiempo orientativo por paso:** steps 1–4 = 6 min (núcleo), steps 5–8 = 4 min (diferenciadores), 2 min cierre + preguntas.

---

## 6. What to say on each screen — cheatsheet

| Pantalla | Frase de 1 línea |
|---|---|
| Inicio | "Tu obra de hoy en una pantalla." |
| Detalle de obra | "Cuánto has presupuestado, gastado, cobrado y qué margen vas a sacar." |
| Añadir gasto | "El proveedor te dio el ticket. En 10 segundos se queda asignado." |
| Registrar cobro | "Te llegó el Bizum. Click. Y los cobros pendientes se actualizan." |
| Facturas | "Emites la factura sin abrir Word." *(cuando esté listo)* |
| Tickets | "Foto, asignar, gasto. Sin OCR aún, pero ya verás el flujo." |
| Reports | "Tu mes en un resumen. Facturado, cobrado, IVA, margen." *(cuando esté listo)* |
| Gestor | "Mes cerrado. Paquete listo. Tu gestor te lo agradece." *(cuando esté listo)* |

## 7. What NOT to promise

- ❌ **No es contabilidad oficial.** No hay libro diario, ni doble partida, ni asientos.
- ❌ **No presenta modelos fiscales** (303/130/115/390/...). El gestor sigue presentando.
- ❌ **No es e-invoicing legal** (Verifactu, TicketBAI, FacturaE). Las facturas son administrativas.
- ❌ **No hay conciliación bancaria** automática. El cobro lo marcas tú.
- ❌ **No hay OCR/IA real todavía**. Los tickets y la captura son placeholders.
- ❌ **No reemplaza al gestor.** Le prepara el material limpio.
- ❌ **No integra con Sage / A3 / Holded** todavía. La exportación es CSV/PDF del MVP.
- ❌ **No hay app nativa** (PWA mobile-first). iOS/Android puros vienen después.
- ❌ **No es un ERP** ni gestor de proyectos industrial.

Si te preguntan por algo de esa lista: di **"sí, está en la hoja de ruta"** o **"no es para nosotros"**, según el caso.

## 8. Current MVP limitations (be honest)

| Limitación | Realidad actual |
|---|---|
| Persistencia | Solo en sesión del navegador (`sessionStorage`). Cerrar el navegador = se pierde. |
| Auth | Hardcoded `org-demo`. No hay login real. |
| OCR | Simulado. No hay subida real de fotos. |
| AI | Simulado. No hay llamadas a proveedores. |
| Pagos | Marcado manual. No hay Bizum/Stripe/SEPA real. |
| Email/WhatsApp | No hay envío. |
| PDF de facturas | No hay generación real todavía. |
| E-invoicing | Cero. |
| Conciliación bancaria | Cero. |
| Integración con gestor | Solo CSV/PDF mock; no hay export directo a Sage/A3/Holded. |
| Multi-tenant real | El modelo está, pero sin Supabase + RLS aún. |

> **Cómo lo cuentas:** "Esto es la prueba funcional. La capa de datos real con Supabase, OCR de tickets, generación de PDF y exportación al gestor las tenemos en la hoja de ruta. Quiero validar contigo si el flujo y los números tienen sentido antes de invertir en backend."

## 9. Pricing hypothesis (orientativa)

Ver `docs/OBRARENTABLE_PRICING.md` para detalle. Resumen:

- **Starter** ~ 19 €/mes — 1 usuario, hasta 20 facturas/mes, OCR limitado.
- **Pro** ~ 29 €/mes — 1 usuario, ilimitado en facturas/gastos, OCR/IA con créditos incluidos.
- **Plus / Team** ~ 49 €/mes — 2–5 usuarios, exportación gestor avanzada.
- **Pilot** primer trimestre con descuento o gratis a cambio de feedback estructurado.

## 10. Questions to ask a real tradesperson

Después de la demo, preguntar (sin pedir compromiso):

**Sobre su realidad actual:**
1. ¿Cómo haces hoy los presupuestos? ¿Plantilla, Excel, en papel?
2. ¿Cómo emites las facturas? ¿Plantilla Word, software, gestor?
3. ¿Qué haces con los tickets de proveedor a lo largo del mes?
4. ¿Cómo sabes ahora si una obra te dio margen?
5. ¿Cuánto tiempo te lleva preparar los papeles del trimestre para el gestor?
6. ¿Cuántos cobros tienes ahora pendientes? ¿Cómo los persigues?

**Sobre la app:**
7. De lo que has visto, ¿qué pantalla te resultaría más útil **mañana**?
8. ¿Qué te ha sobrado? ¿Qué echas en falta?
9. ¿Qué le diría tu gestor si le mandas el paquete del mes?
10. ¿Qué te haría pagar 29 € al mes por esto? ¿Qué te haría dudar?
11. ¿Pagarías tú o lo pagaría tu gestor?

**Sobre integración:**
12. ¿Qué herramienta/sistema usa tu gestor? (Sage, A3, Holded, Excel...)
13. ¿Tienes app del banco que ya usas para Bizum/transferencias?

## 11. Pilot success criteria

Un piloto se considera exitoso si, después de **30 días**:

- ✅ El usuario ha registrado al menos **1 obra/trabajo** activo + 5 gastos + 2 cobros.
- ✅ Ha emitido al menos **1 factura** desde la app.
- ✅ Ha generado al menos **1 paquete mensual** y lo ha mandado al gestor.
- ✅ Reporta menos tiempo en cierre mensual vs. su flujo anterior (auto-reportado).
- ✅ Está dispuesto a **pagar 19–29 €/mes** o ya lo está haciendo.
- ✅ Cita un caso concreto donde la app le ahorró un olvido (cobro, ticket, factura).
- ✅ El gestor del usuario nos da feedback positivo o concreto sobre el paquete que recibe.

Si **no** se cumple lo de pagar o lo del caso concreto, el piloto es señal de aprendizaje pero no de tracción comercial.

## 12. Signs of strong interest

Señales de que la demo ha conectado. Si ves dos o más de estas durante la conversación, propón el piloto ahora mismo, no la próxima semana.

| Señal | Qué significa |
|---|---|
| Pregunta por su gestor específico ("¿funciona con Sage? ¿con Holded?") | Está mentalmente integrándolo en su flujo real. |
| Da un número concreto de su problema ("tengo 4 cobros sin cobrar ahora") | Proyecta su situación en la demo. |
| Pide ver una pantalla que no has enseñado | Explora por iniciativa propia. |
| Dice "esto lo necesitaría para X" (X = su obra real, su trimestre, su gestor) | Está imaginando su caso de uso. |
| Pregunta por el precio sin que lo hayas mencionado | Está evaluando coste/beneficio. |
| Llama a alguien en el momento ("espera que llamo a mi socio/gestor") | Señal de compra fuerte. |
| Dice "yo ahora mismo hago esto con Excel/WhatsApp/libreta" | Está identificando el dolor que resuelves. |
| Pide una fecha de disponibilidad o lanzamiento | Está considerando cuándo adoptar. |

## 13. Red flags

Señales de que el interlocutor **no es el cliente adecuado ahora mismo** o la reunión no va a ningún lado. Recoge aprendizaje y corta educadamente.

| Señal | Qué hacer |
|---|---|
| "Yo ya uso [Holded / Sage / A3 / Billin] y estoy bien" | Preguntar qué le falta en esa herramienta. Si está cubierto, agradecer y salir. |
| "Esto lo hace mi gestor, yo no me meto" | Target equivocado: hablar directamente con el gestor o descartarlo. |
| "Tengo más de 10 empleados / varias empresas" | Demasiado grande para el MVP. Anotar para versión empresa. |
| Pregunta por funciones enterprise en los primeros 2 minutos ("¿tiene API? ¿integra con nuestro ERP?") | Probablemente fuera de rango. Calificar mejor antes de la próxima demo. |
| Solo quiere el PDF de facturas legal (TicketBAI, Verifactu) | Necesidad real, pero no nuestro MVP. Referir a FacturaDirecta / Holded. |
| No tiene ni una obra activa ni una factura pendiente en los últimos 90 días | Actividad demasiado baja para que la app sea relevante ahora. |
| Quiere probarla pero no quiere dar feedback estructurado | Piloto sin valor de aprendizaje. Negociar o descartar. |

## 14. Suggested pilot offer

Cuando el interlocutor muestra interés claro (ver sección 12), haz esta oferta concreta. No negocies condiciones — el piloto tiene un propósito de aprendizaje, no de ingresos.

---

**Oferta piloto estándar:**

> "Te propongo que lo uses tú durante **4 semanas sin coste**. A cambio, me comprometería a llamarte a la semana 2 y a la semana 4 para entender qué funciona y qué no. Lo que aprendamos entra directo en la siguiente versión. Si al mes ves que no te aporta nada, ningún problema. Si ves que sí, te ofrezco el primer trimestre completo a mitad de precio mientras terminamos las funciones de producción."

**Condiciones del piloto:**

- Acceso gratuito durante **30 días** a la versión MVP.
- El piloto se compromete a registrar al menos 1 obra real con gastos y cobros reales.
- Llamada de seguimiento en la semana 2 (15 min) y en la semana 4 (30 min).
- Entrega de feedback escrito mínimo: 3 cosas que le sirven + 3 que le faltan.
- No requiere tarjeta de crédito.

**Qué no incluye el piloto:**

- OCR/IA real (simulado en MVP).
- PDF de facturas real.
- Exportación real al gestor.
- Persistencia cross-dispositivo (sesión del navegador, MVP).

**Qué ofreces si el piloto va bien:**

> "Primer trimestre a 14 €/mes (50% de descuento del plan Pro) a cambio de continuar dando feedback mensual."

---

Si el interlocutor es un **partner** (gestor, asesor, distribuidor) en lugar de un usuario final, el piloto cambia:

> "Te propongo que lo instales con 2–3 clientes tuyos durante un mes. Tú coordinas el feedback. A cambio, si decidimos lanzar, te ofrezco una comisión del 20% sobre los planes de los clientes que traigas y acceso gratuito para tu despacho."

## 15. Follow-up message template

Enviar **dentro de las 2 horas siguientes** a la demo. Elegir según canal habitual del interlocutor.

---

**Versión WhatsApp (para autónomo / tradesperson):**

> Hola [nombre], ha sido un placer hablar hoy. Te dejo el enlace al demo que hemos visto: [ENLACE]. Si quieres probarlo con una obra real esta semana, me dices y te activo el acceso piloto. Sin coste, sin compromiso — solo me interesa saber si realmente te ahorra tiempo. Cualquier duda me escribes aquí. ¡Gracias!

---

**Versión email (para gestor / partner):**

Asunto: **ObraRentable OS — demo de hoy + acceso piloto**

> Hola [nombre],
>
> Gracias por el tiempo de hoy. Te adjunto una captura de las pantallas que vimos y el enlace al demo: [ENLACE].
>
> Como comentamos, la idea es validar si el flujo — obras, gastos, cobros y report mensual para el gestor — realmente ahorra tiempo a tus clientes o a tu despacho antes de invertir en la capa de backend completa.
>
> Si quieres, la semana que viene te activo acceso para 2–3 clientes sin coste durante 30 días, con dos llamadas de seguimiento incluidas.
>
> ¿Te parece bien que hablemos el [día]?
>
> Un saludo,
> [Tu nombre]
> ObraRentable OS

---

**Versión LinkedIn (para contacto frío / referido):**

> Hola [nombre], te mando el enlace al demo de ObraRentable OS que comentamos: [ENLACE]. Está pensado para autónomos de oficios que llevan obras, gastos y cobros entre WhatsApp y Excel. Si conoces a alguien que encaje, me encantaría que me lo presentaras. ¡Gracias!
