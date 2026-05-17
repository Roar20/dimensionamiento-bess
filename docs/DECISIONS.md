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

## 2026-05-16 — Stack Vite + React 19 + TS strict

**Decisión:** Mismo stack que curvas-bess, subiendo a React 19 y forzando TS strict.
**Razón:** Reuse de ~1,800 LOC validados, sin necesidad de SSR.
**Alternativa descartada:** Next.js App Router (overhead injustificado para SPA con localStorage).
