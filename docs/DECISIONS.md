# Bitácora de decisiones

Cada entrada: fecha, decisión, razón, alternativas descartadas.

## 2026-05-16 — Repo nuevo `dimensionamiento-bess`

**Decisión:** Reescritura desde cero en lugar de cleanup de `curvas-bess`.
**Razón:** Acoplamiento transversal del escalado overbuild en motor, storage y UI.
**Alternativa descartada:** Cleanup quirúrgico (1-2 semanas con riesgo permanente vs 3-5 días de reescritura).

## 2026-05-16 — Alcance Wave 1

**Decisión:** Producto solo modela SFV existente + BESS, sin ampliación de capacidad CFE.
**Razón:** CRE A/113/2024 permite BESS sin trámite adicional solo si no se amplía capacidad.
**Alternativa descartada:** Modelar overbuild ("Wave 2"); se reserva para versión futura.

## 2026-05-16 — Datos del SFV son horarios, no cincominutales

**Decisión:** El loader del Módulo 1A acepta reportes anuales/mensuales en formato Excel rígido (`Día de Operación`, `Hora 1-24`, `Energía Registrada [MWh]`). No interpolamos a 5-min; el motor trabajará sobre 8,760 (u 8,784 si es bisiesto) registros horarios.
**Razón:** Es el formato que entrega el operador real (caso Tequila). Interpolar a 5-min introduce ruido sin información adicional.
**Alternativa descartada:** Aceptar varios formatos de entrada en el 1A. Se reserva la flexibilidad para módulos futuros si aparece otro caso.

## 2026-05-16 — Convención de timestamp: hora-ending → inicio de intervalo

**Decisión:** El archivo de generación usa hora-ending (la fila con hora=1 cubre 00:00-01:00). Internamente, cada `RegistroHorario.timestamp` representa el **inicio** del intervalo (00:00 para esa misma fila).
**Razón:** Las funciones del motor que vienen (curva diaria, perfiles horarios, despacho del BESS) son más naturales con timestamps inicio-de-intervalo.
**Alternativa descartada:** Conservar la hora-ending. Habría obligado a cada consumidor a recordar restar 1 hora.

## 2026-05-16 — Precio PPA opcional en el onboarding

**Decisión:** El campo "Precio PPA (MXN/MWh)" es opcional en el Módulo 1A. Si no se captura, se persiste como `null`.
**Razón:** El motor financiero (módulo posterior) puede pedirlo más adelante; bloquear el onboarding por un dato que el usuario no siempre tiene a la mano agrega fricción innecesaria.
**Alternativa descartada:** Hacerlo requerido desde el principio.

## 2026-05-16 — Paleta y sistema de diseño formalizados

**Decisión:** La paleta extraída del mockup del comercial se formaliza como variables CSS en `:root` (`--color-header-bg`, `--color-primary`, `--color-info-bg`, etc.) y se expone a Tailwind bajo namespaces `brand-*`, `ink-*`, `field-*`, `action`, `info-*`, `status-*`. Fuente única: Inter Variable, con números tabulares activos en tablas y KPIs.
**Razón:** Define el lenguaje visual para los 10 módulos siguientes sin reinventarlo cada vez.
**Alternativa descartada:** Usar la paleta default de shadcn. Era genérica y no respetaba la marca de la captura.

## 2026-05-16 — Persistencia 100% localStorage, sin servidor

**Decisión:** El estado del proyecto (configuración + registros + warnings) se persiste en `localStorage` bajo `dimensionamiento-bess:datos-sfv`. No hay backend, no se sube archivo a ningún lado.
**Razón:** El simulador es una herramienta interna de dimensionamiento; los datos del cliente no deben salir del navegador.
**Alternativa descartada:** Backend para compartir análisis entre usuarios. Se evalúa solo si aparece la necesidad.

## 2026-05-16 — Stack Vite + React 19 + TS strict

**Decisión:** Mismo stack que curvas-bess, subiendo a React 19 y forzando TS strict.
**Razón:** Reuse de ~1,800 LOC validados, sin necesidad de SSR.
**Alternativa descartada:** Next.js App Router (overhead injustificado para SPA con localStorage).
