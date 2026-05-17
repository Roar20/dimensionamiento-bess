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

## 2026-05-16 — Motor SFV (Módulo 1B) portado del Colab

**Decisión:** Las 4 funciones del motor SFV (`caracterizarRecurso`, `detectarClipping`, `calcularPerfilHorario`, `caracterizarVariabilidad`) son una transliteración 1:1 de las secciones 4-8 de la Parte 1 del Colab `Motor_BESS_v2_05152026.ipynb`. Nombres de campos del output coinciden literalmente con el Colab para permitir validación cruzada con la fuente.
**Razón:** El Colab es la fuente de verdad numérica del dominio; mantener paridad de nombres y fórmulas habilita auditar cualquier discrepancia comparando lado a lado.
**Alternativa descartada:** Reescribir nombres en estilo TS idiomático (camelCase, sin sufijos de unidad). Habría roto la validación cruzada con el Colab.

## 2026-05-16 — `headroom_al_poi_pct` excluido de Wave 1

**Decisión:** El KPI `headroom_al_poi_pct` del Colab no se porta a `ResultadoCaracterizacion`. El motor SFV de Wave 1 no expone "espacio disponible al POI" porque ese lenguaje pertenece al análisis de overbuild (Wave 2).
**Razón:** Wave 1 modela SFV existente con capacidad CFE fija; hablar de "headroom" implícitamente sugiere ampliación, que está fuera de alcance regulatorio (CRE A/113/2024).
**Alternativa descartada:** Conservar el campo "por completitud". Habría introducido vocabulario overbuild en la API pública sin caso de uso.

## 2026-05-16 — Convención hora-ending replicada en el motor

**Decisión:** El motor SFV reporta `hora_pico`, `perfil_por_hora` y la ventana hora-punta CFE en convención hora-ending 1..24, igual que el Colab. Internamente convierte desde el timestamp inicio-de-intervalo del Módulo 1A con `hora_ending = timestamp.getHours() + 1`.
**Razón:** Mantiene paridad numérica con el Colab y con el lenguaje regulatorio CFE (la ventana punta GDMTH se cita siempre como "18:00-22:00 hora-ending").
**Alternativa descartada:** Exponer las horas en convención 0..23 inicio-de-intervalo. Habría obligado a traducir cada output al lenguaje del Colab/CFE en todos los consumidores.

## 2026-05-16 — Heatmap con clave `MM-DD`

**Decisión:** El heatmap día×hora usa clave `MM-DD` en lugar de `dia_mes` (1-31) del Colab.
**Razón:** Garantiza unicidad en datasets multianuales y permite ordenar lexicográficamente sin convertir.
**Alternativa descartada:** Usar `dia_mes` numérico (rompe con datasets que cruzan meses).

## 2026-05-16 — Rangos esperados Tequila 2025 para validación visual (Módulo 2)

Estos valores son la referencia para validar el preview del Tab SFV cuando se integre el Módulo 2. NO viven como tests automatizados porque el dataset real no está en el repo:

| KPI                       | Valor esperado | Tolerancia |
|---------------------------|----------------|------------|
| `energia_total_mwh`       | 913.32         | ±0.5       |
| `pico_kw`                 | 446.7          | ±1         |
| `horas_totales`           | 8760           | exacto     |
| `dias_analizados`         | 365            | exacto     |
| `factor_planta_pct`       | 20.85          | ±0.05      |
| `factor_capacidad_pct`    | 20.85          | ±0.05      |
| `horas_sol_equiv_diaria`  | 5.00           | ±0.05      |
| `pico_vs_poi_pct`         | 89.34          | ±0.1       |
| `horas_en_clipping`       | 0              | exacto     |
| `hay_clipping_real`       | false          | exacto     |
| `hora_pico`               | 13             | exacto (hora-ending) |
| `hora_inicio_generacion`  | ~8             | ±1         |
| `hora_fin_generacion`     | ~19            | ±1         |
| `pct_energia_en_punta`    | 5-10           | rango      |

(Caso: POI = 500 kW, cap_pv_instalada = 500 kW, archivo `REPORTE_ANUAL_GENERACIÓN_2025_x_horas_TEQUILA_1.xlsx`).

## 2026-05-16 — Stack Vite + React 19 + TS strict

**Decisión:** Mismo stack que curvas-bess, subiendo a React 19 y forzando TS strict.
**Razón:** Reuse de ~1,800 LOC validados, sin necesidad de SSR.
**Alternativa descartada:** Next.js App Router (overhead injustificado para SPA con localStorage).
