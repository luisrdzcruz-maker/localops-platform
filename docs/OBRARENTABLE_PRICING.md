# ObraRentable OS — Pricing Strategy

> Pricing hypothesis and rationale for ObraRentable OS. Pairs with `docs/OBRARENTABLE_PRODUCT_SPEC.md`, `docs/OBRARENTABLE_DEMO_SCRIPT.md`, `docs/OBRARENTABLE_CUSTOMER_DISCOVERY.md`. **Hypotheses to validate**, not committed prices.

## 1. Pricing positioning

ObraRentable OS sits between three things the user already pays for or tolerates:

- **Plantillas Excel + Word** que el autónomo arrastra. **Coste:** 0 € pero tiempo y errores.
- **Gestoría** mensual (60–150 €/mes según volumen). **Coste real:** mucho más si añade horas de papeleo.
- **Software de facturación generalista** (Holded ~ 12 €/mes, Quipu ~ 9–25 €, FacturaDirecta ~ 10 €, ContaSimple ~ 6 €). **Coste:** bajo pero generalista, no oficio-specific.

Nuestra propuesta:

> "No reemplazamos a tu gestor. No somos un Excel mejorado. Somos el cockpit financiero del autónomo de oficios: trabajos, presupuestos, facturas, gastos, cobros y un paquete listo para tu gestor cada mes."

Rango de precio defendible: **19–49 €/mes** según plan. Justificación:

- Por encima del software generalista pequeño (12–15 €) porque el flujo está **diseñado para oficios** (obras, fases, tickets de proveedor, paquete para gestor).
- Por debajo del coste percibido de "una hora del fin de semana sentado con papeles" (~ 30–50 € de tiempo del autónomo) y del coste de un olvido de cobro (~ 200–2.000 €).
- Por debajo del ARPU típico de un ERP/contable que no es nuestro ICP.

**No competimos en precio.** Competimos en **simplicidad, foco en oficios y output limpio para el gestor**.

## 2. Suggested plans

Tres planes que cubren el funnel: **probar, usar diariamente, equipo pequeño**.

### Starter — para empezar
**Para:** autónomo solo que quiere salir del Excel sin pelearse con un ERP.

### Pro — uso diario
**Para:** autónomo o micro-empresa que ya factura cada semana y persigue cobros.

### Plus / Team — equipo pequeño
**Para:** equipos de 2–5 personas (un titular + 1–4 trabajadores que registran tickets).

### Pilot — primer piloto
**Para:** los 10–20 primeros clientes que dan feedback estructurado a cambio de precio reducido o gratis.

## 3. Monthly price hypotheses

| Plan | Hipótesis A (anclaje bajo) | Hipótesis B (anclaje medio) | Hipótesis C (anclaje alto) |
|---|---|---|---|
| Starter | **19 €** | 19 € | 29 € |
| Pro | **29 €** | 39 € | 49 € |
| Plus / Team | **49 €** | 59 € | 79 € |
| Add-on Gestor | +5 €/mes | +9 €/mes | +15 €/mes |

**Recomendación inicial:** anclaje A (19 / 29 / 49). Razones:

- Bajo riesgo de perder al ICP en la primera conversación.
- Deja margen para subir si los pilotos confirman valor.
- Diferencial 10 € entre Starter y Pro está dentro del rango de "lo voy a probar y subo si me sale a cuenta".
- 49 € Team es mentalmente "menos que una asesoría barata". Permite venderlo sin justificarse.

**Cuándo subir a hipótesis B/C:**
- Si 3 de cada 5 entrevistados aceptan 29 € sin pestañear → subir Pro a 39 €.
- Si los pilotos dicen "esto me ahorra X horas" cuantificable → subir Pro a 49 €.
- Si entran 5 clientes Plus en un mes → subir a 59–79 €.

## 4. What each plan includes

| Función | Starter (19 €) | Pro (29 €) | Plus / Team (49 €) |
|---|:-:|:-:|:-:|
| **Usuarios** | 1 | 1 | 2–5 |
| **Trabajos / obras** activos | 5 | Ilimitados | Ilimitados |
| **Facturas / mes** | 20 | Ilimitadas | Ilimitadas |
| **Gastos / mes** | Ilimitados | Ilimitados | Ilimitados |
| **Tickets / mes** *(captura manual)* | 30 | 200 | 500 |
| **Cobros** | ✅ | ✅ | ✅ |
| **Reports mensuales** | Solo último mes | 12 meses | Ilimitado |
| **Paquete para gestor** *(CSV/PDF)* | 1 paquete/mes | 4 paquetes/mes | Ilimitado |
| **Multiusuario** | — | — | ✅ |
| **AI/OCR créditos** *(futuro, ver §6)* | 25 créditos/mes | 200 créditos/mes | 500 créditos/mes |
| **Soporte** | Chat asíncrono | Chat asíncrono | Prioritario |

**Add-on Gestor (+5–9 €/mes):** export estructurado para Sage/A3/Holded *(roadmap)* + nota directa al gestor.

## 5. Free trial limits

> Free trial es para **probar**, no para usar en producción gratis.

- **Duración:** 14 días.
- **Trabajos activos:** 2 máximo.
- **Facturas emitidas:** 5 máximo.
- **Tickets/gastos:** 20 máximo.
- **Reports:** disponibles, sin export.
- **Paquete gestor:** disponible, sin descarga (solo preview).
- **AI/OCR créditos:** 10 (cuando se active).
- **Multiusuario:** 1 usuario.

Al expirar:
- Datos se conservan **30 días** read-only.
- Si el usuario no convierte, se notifica antes de borrar.
- Conversión esperada: **15–25%** del trial → Starter o Pro (hipótesis a validar).

## 6. AI/OCR credit model

> ⚠️ **Por qué importa:** OCR e IA son los costes variables más peligrosos del producto. Un trial sin límite puede costar más al mes que el plan completo. Política: **siempre metered, nunca ilimitado en plan estándar**.

Ver `.cursor/rules/05-ai-cost-control.mdc` para la regla técnica.

### Coste por acción (estimado, a calibrar)

| Acción | Coste interno aprox. | Créditos |
|---|---|---|
| OCR de ticket (foto → campos) | 0,02–0,06 € | **5** |
| OCR de factura proveedor (PDF) | 0,05–0,15 € | **10** |
| AI: redactar concepto de factura | 0,01 € | **1** |
| AI: clasificar gasto por categoría | 0,01 € | **1** |
| AI: generar resumen mensual narrativo | 0,03 € | **3** |
| AI: extraer presupuesto desde notas | 0,05 € | **5** |

### Créditos incluidos por plan

- Starter: 25 créditos/mes (~ 5 tickets escaneados).
- Pro: 200 créditos/mes (~ 40 tickets + clasificación automática del mes).
- Plus / Team: 500 créditos/mes.

### Paid credit packs

- **+100 créditos** — 4,90 € (uso ocasional).
- **+500 créditos** — 19,90 € (uso regular).
- **+2.000 créditos** — 59,90 € (equipo activo).

### Por qué unlimited es peligroso

- Un autónomo motivado puede subir 200 fotos en una tarde "para ponerse al día". Coste: 4–12 € en una sesión.
- Sin límite el churn cae pero el COGS se dispara.
- Reputación: si la app se siente "rápida porque me deja escanear todo" → expectativa permanente, difícil de revertir.

### UI requirement

Cada acción AI/OCR debe mostrar:
- Coste en créditos antes de ejecutar.
- Saldo disponible.
- Aviso claro si se va a quedar sin créditos.
- Plan suggestion si supera el límite.

## 7. Competitor alternatives (qué hace nuestro ICP hoy)

### Excel + plantilla Word
- **Coste:** 0 € + horas.
- **Dolor:** se rompe, no escala, no sabes el margen, fin de mes infernal.
- **Cómo ganamos:** "Esto te ordena el mes en 5 minutos en lugar de un sábado entero."

### Solo gestor / gestoría
- **Coste:** 60–150 €/mes.
- **Dolor:** el autónomo le manda papeles desordenados; el gestor cobra extra por horas de papeleo; el autónomo no sabe nada hasta el cierre del trimestre.
- **Cómo ganamos:** "Le mandas el paquete listo. Tu gestor lo carga y se acabó. Tú ves los números cada día."

### Holded / Quipu / FacturaDirecta / ContaSimple
- **Coste:** 9–25 €/mes.
- **Dolor:** generalistas, no entienden de obras, no separan por trabajo, UI orientada a oficinas.
- **Cómo ganamos:** "Aquí cada gasto va a una obra. Cada obra tiene un margen. No te toca traducir al lenguaje del oficio."

### TicketBAI / Verifactu / FacturaE oficial
- **No son competencia.** Nosotros hablamos al usuario; el sistema oficial es **infraestructura legal** que el gestor usa por debajo. Nuestra app es un layer encima.

### Apps de gestor (Sage, A3, Holded, Anfix...)
- **No son competencia directa.** Son herramientas que usa el gestor. Nuestro objetivo es exportar a ellas, no reemplazarlas.

### "Tener una pareja/familiar que lleva los papeles"
- **Sí, es competencia.** Pero el dolor existe igual: el familiar quiere recuperar las tardes. Mensaje: "Que (tu pareja/madre/hermano) recupere los sábados."

## 8. Recommended first pilot offer

Para los **primeros 10–20 pilotos**:

> **3 meses al precio de 1.** 19 € por todo el primer trimestre. A cambio:
> - Feedback estructurado cada 2 semanas (15 min llamada o cuestionario).
> - Permitir un caso de éxito si la experiencia es positiva.
> - Acceso al gestor del piloto para validar el paquete mensual *(opcional)*.

Razón:
- Reduce fricción de "qué pasa si no me funciona".
- Tres meses es el horizonte mínimo para que un autónomo cierre un mes admin completo y vea el efecto.
- 19 € flat suena casi simbólico → maximiza conversión.
- Convierte a Pro (29 €) al expirar si la app se ha usado de verdad.

**Conversión objetivo del piloto:**
- 60% renueva en Pro al precio normal.
- 30% pide ajustes / extensión piloto.
- 10% churn (aprendizaje).

## 9. What NOT to promise

Aplicable a la página de pricing y al pitch de ventas. **Nunca prometer:**

- ❌ "Reemplaza a tu gestor."
- ❌ "Presenta el IVA por ti."
- ❌ "Conexión automática con tu banco."
- ❌ "Genera factura electrónica oficial / Verifactu / TicketBAI."
- ❌ "OCR ilimitado." *(siempre por créditos)*
- ❌ "Tasa garantizada de cobro" o cualquier promesa sobre cobros vencidos.
- ❌ "Cumplimiento fiscal garantizado." *(la app no asume responsabilidad fiscal del usuario)*
- ❌ "Migración automática desde Holded/Quipu/X." *(salvo cuando se construya y se valide)*

Si un cliente pide algo de esa lista: **decir no, decirlo claro, ofrecer la hoja de ruta o redirigir a otra solución**. Mejor perder un cliente fuera de ICP que arrastrar una expectativa imposible.

## 10. Pricing review cadence

- **Mes 1:** validar 19/29/49 con primeros 10 clientes. Ajustar si los precios A no convierten.
- **Mes 3:** revisar churn y CAC. Si hay >3 cancelaciones citando precio → mantener 19 € pero revisar valor entregado.
- **Mes 6:** decidir si subir a hipótesis B (29/39/59) según LTV y feedback de gestor add-on.
- **Año 1:** evaluar si se introduce un plan **Asesoría** (199–299 €/mes) para gestorías que gestionan 10+ autónomos.

Las decisiones de precio se anotan en este doc + en `docs/OBRARENTABLE_CUSTOMER_DISCOVERY.md` con la fecha y el dato que las motivó.
