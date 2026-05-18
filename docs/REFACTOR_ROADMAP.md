# Roadmap de migración visual y funcional — `dimensionamiento-bess`

**Proyecto:** Dimensionamiento BESS Soluciones MHG
**Repo base:** `Roar20/dimensionamiento-bess`
**Estado base:** Módulos 0-4 mergeados en `main`, PR #12 abierto (Tab SFV+BESS), 131 tests verdes, build limpio
**Fecha:** 17 mayo 2026
**Consultor:** Rodrigo

---

## Contexto para Claude Code

Este documento contiene 6 prompts incrementales para llevar `dimensionamiento-bess` desde su estado actual a una versión alineada con los mockups HTML validados por el cliente. El motor de cálculo existente (`src/lib/core/sfv/` y `src/lib/core/bess/`) se conserva como fuente de verdad numérica; lo que se migra es la **capa visual**, la **estructura narrativa** y se **agrega funcionalidad faltante** (potencia firme, frente Pareto, motor financiero).

**Decisiones de producto ya tomadas (no negociar):**

1. Estructura narrativa tipo pregunta ("¿Cuánto genera tu SFV?") → eliminada. Registro consultor McKinsey/BCG uniforme.
2. Anatomía de energía → fuera del Tab BESS (catálogo plano) → movida a Tab SFV+BESS donde pertenece conceptualmente.
3. Selector temporal con 6 granularidades → conservado pero descentralizado e inline en charts específicos. Default = vista año completo.
4. Toggle Vista cliente/técnico → eliminada. Registro uniforme.
5. Precios del mockup como defaults editables, marcados como "Proxy Estanzuela 2 — pendiente confirmar para Tequila".
6. Frente Pareto y matriz de barrido → prioridad alta, antes del motor financiero.

**Spec visual (obligatoria):** los 4 archivos HTML en `docs/mockups/`:
- `tab_01_sfv.html` — Análisis de la curva de generación del SFV
- `tab_02_bess.html` — Catálogo BESS Hyperstrong (plano, sin anatomía)
- `tab_03_sfv_bess.html` — Análisis del SFV + BESS (incluye anatomía de energía + Pareto)
- `tab_04_financiero.html` — Análisis financiero

Cada prompt referencia el HTML que debe replicar. Claude Code abre el archivo, lee estructura, colores, tipografía, KPIs, textos, y reproduce con fidelidad. **No reinterpretar, no "mejorar", no agregar elementos no presentes en el mockup.** Si el prompt menciona algo que no está en el HTML (ej. selector temporal inline), va explícito en el prompt.

**Workflow obligatorio para cada prompt:**

1. Crear rama `feature/<nombre>` desde `main`.
2. Implementar solo lo que pide el prompt.
3. Abrir PR contra `main`.
4. Vercel deployea preview automáticamente.
5. Validación visual en preview por Rodrigo (comparar con HTML de referencia).
6. Si OK → merge a `main`. Si no → iterar en la misma rama.

**Reglas transversales aplicables a TODOS los prompts:**

- **Terminología prohibida:** "PV adicional", "PV total proyecto", "overbuild", "headroom" como capacidad sin usar, "clipping" en UI cliente-facing (existe en motor como `detectarClipping` — mantenerlo en motor, ocultarlo en UI), "+250/+400/+600 kW propuesto", "500 actual + X propuesta", "diagnóstico del recurso PV", "planta" referida al SFV.
- **Terminología obligatoria:** "SFV", "excedentes" (no "curtailment"), unidades explícitas con periodo (h/año, MWh/mes, kWh diario).
- **Registro de copy:** consultor McKinsey/BCG. Conclusión primero. Tooltips densos con metodología. Cero pedagogía didáctica. Bandas "Lectura ejecutiva" al tope de cada tab.
- **Alcance regulatorio:** SFV existente + BESS bajo CRE A/113/2024. Sin modificación de capacidad CFE. POI invariable.
- **Idioma:** español de México. Tuteo profesional. Sin emojis. Sin slang.
- **Audiencia primaria:** el tecnólogo (vendedor de baterías). Usuario experto en el dominio. NUNCA tratar al usuario como novato; los tooltips son técnicos, no educativos.

**Paleta corporativa (de los HTML validados):**

```css
--color-primary:        #1E40AF
--color-primary-light:  #DBEAFE
--color-primary-dark:   #1E3A8A
--color-capture:        #0F766E
--color-capture-light:  #CCFBF1
--color-capture-dark:   #115E59
--color-generation:     #B45309
--color-discharge:      #6366F1
--color-baseline:       #525252
--color-loss:           #991B1B
--color-text-primary:   #171717
--color-text-secondary: #525252
--color-text-tertiary:  #737373
--color-bg-page:        #FAFAF9
--color-bg-card:        #FFFFFF
--color-bg-secondary:   #F5F5F4
--color-border-light:   rgba(0, 0, 0, 0.08)
--color-border-medium:  rgba(0, 0, 0, 0.15)
--radius-md:            8px
--radius-lg:            12px
```

**Tipografía:** Inter (400 y 500 únicamente — nunca 600+). Container `max-width: 1080px; margin: 0 auto; padding: 32px 40px 64px`. **Cero gradientes, sombras o efectos decorativos.** Bordes 0.5px translúcidos.

---

## Estado actual del repo (línea base 17-may-2026)

### Módulos mergeados en `main`

- **Módulo 0** — Bootstrap (Vite + React 19 + TS strict + Tailwind + shadcn)
- **Módulo 1A** — Loader Excel + onboarding del proyecto
- **Módulo 1B** — Motor SFV (4 funciones puras, hora-ending 1..24)
- **Módulo 2** — Tab SFV (con estructura narrativa que se reemplaza en P2)
- **Módulo 3** — Tab BESS (con anatomía de energía que se mueve en P4)
- **Módulo 4** — Motor BESS (despacho greedy + arbitraje, KPIs)

### PR abierto sin mergear

- **PR #12 / Módulo 5** — Tab SFV+BESS inicial (piso SoC 5%, ventana 18-22h, input buffer)

**Acción recomendada antes de arrancar P1:** mergear PR #12 a `main` después de validación, para que P1 trabaje sobre `main` actualizado.

### Motor disponible (conservar, NO tocar en P1 ni P2)

`src/lib/core/sfv/`:
- `caracterizarRecurso`, `detectarClipping`, `calcularPerfilHorario`, `caracterizarVariabilidad`, `agregarPorMes`

`src/lib/core/bess/`:
- `calcularEnergiaPorCategoria`, `construirCategoriasDefault`, `calcularResumenCategorias`
- `simularDespachoGreedy`, `simularDespachoArbitraje`, `calcularKPIs`, `simularCompleto`, `escalarEquipo`

`src/lib/bess/`:
- `CATALOGO_HYPERSTRONG`, `recomendarEquipoOptimo`

### Gaps de motor identificados (se cierran en P4 y P5)

| Concepto | Dónde se agrega |
|---|---|
| Bandas P25/P75 por hora del día (para perfil horario) | P2 (extensión de `calcularPerfilHorario`) |
| Excedentes mensuales agregados | P2 (helper nuevo en `lib/core/sfv/`) |
| Estadísticos de excedentes diarios (mediana, P90, día crítico) | P2 (helper nuevo) |
| Potencia firme (P80 descarga en hora-punta) | P4 (helper en `lib/core/bess/`) |
| Frente Pareto / matriz de barrido kW × duración | P4 (helper nuevo `barrerConfiguraciones`) |
| Motor financiero (VAN, TIR, Payback, LCOS, sensibilidad, CAPEX, OPEX, SOH) | P5 |

---

## P1 · Sistema de diseño y migración visual base

**Objetivo:** migrar tokens, paleta, container, tab nav y tipografía al sistema de los mockups. No tocar la estructura interna de las tabs todavía — solo reskin. Las tabs siguen funcionando con su layout actual, solo cambia el look.

**Estimación:** 45 min Claude Code.
**Rama:** `feature/sistema-diseno-mockup`
**Riesgo:** bajo (cambios concentrados en tokens y layout chrome, no en lógica).

### Tareas

1. **Subir los 4 archivos HTML** a `docs/mockups/` (te paso los archivos aparte para que los subas):
   - `tab_01_sfv.html`, `tab_02_bess.html`, `tab_03_sfv_bess.html`, `tab_04_financiero.html`

2. **Reemplazar tokens en `src/index.css` o `tailwind.config.ts`:**
   - Cambiar `primary` de `#4A7C59` → `#1E40AF`.
   - Cambiar `header-bg` de `#1B3A52` → eliminar (no hay chrome global navy en mockups).
   - Cambiar `page-bg` de `#F5F7FA` → `#FAFAF9`.
   - Cambiar texto: `text-primary` `#171717`, `text-secondary` `#525252`, `text-tertiary` `#737373`.
   - Agregar tokens nuevos: `--color-capture: #0F766E`, `--color-generation: #B45309`, `--color-discharge: #6366F1`, `--color-loss: #991B1B`.
   - Bordes: `--color-border-light: rgba(0, 0, 0, 0.08)` para 0.5px translúcidos.
   - Radios: `--radius-md: 8px`, `--radius-lg: 12px`.

3. **Tipografía:**
   - Cargar Inter de Google Fonts en `index.html`.
   - Configurar como font-family principal en `body`.
   - Pesos disponibles: 400 y 500 únicamente.
   - **Importante:** ningún elemento debe usar 600+. Si existe en el código actual, reemplazar por 500.

4. **Container global:**
   - Cambiar `max-w-7xl` (1280px) por `max-w-[1080px]` con `mx-auto px-10 py-8 pb-16` (padding 32/40).

5. **Eliminar `AppHeader` navy con chrome global:**
   - Quitar el header navy `#1B3A52` con tab nav + EncabezadoContextual blanco.
   - Reemplazar por **tab nav inline arriba de cada página** (estilo "píldoras"): tab activa con `bg-primary` y texto blanco, tabs inactivas con `text-tertiary`. Ver `tab_01_sfv.html` líneas de `.tab-nav` para referencia exacta.
   - Cada tab tiene su propio header propio con título y chips de metadata.

6. **Eliminar toggle Vista cliente/técnico:**
   - Quitar el switch del header global.
   - Eliminar todos los `<BloqueTecnico>` condicionales en favor de `<details>` "Metodología y supuestos" siempre visible al final de cada tab.
   - Tip: buscar usos de `viewMode === 'tecnico'` y eliminar condicionales.

7. **Reemplazar componentes visuales base** (crear o ajustar):
   - `<KpiCard>`: card con border 0.5px translúcido, `border-left: 3px` de color según variant (`primary`, `capture`, `default`). Sin shadow. Sin ícono Info adicional — el tooltip va en atributo `title=""` nativo. Ver `tab_01_sfv.html` líneas de `.kpi-card`.
   - `<LecturaEjecutiva texto={...} />`: banda con `border-left: 3px` azul, fondo `--color-primary-light`, label arriba en versalitas 10px peso 500 letter-spacing 0.6px, texto principal 14px line-height 1.55.
   - `<MetodologiaDetalles />`: `<details>` colapsable estandarizado con triangle indicator izquierdo.
   - `<FooterEstandar fuente versión fecha />`: pie con fuente y versión, separado por border-top 0.5px.

8. **Iconos:**
   - Reemplazar `lucide-react` por **Tabler Icons webfont** (cargado desde CDN como en los mockups) **SOLO en componentes nuevos o que se reescriben**. Los componentes existentes que se mantienen pueden seguir con `lucide-react` por ahora — no fragmentar el cambio de iconos en este PR.
   - Si hay tiempo: documentar en `docs/MIGRATION_NOTES.md` que iconos migrarán completamente cuando se reescriban las tabs.

### Lo que NO se hace en este prompt

- No tocar la estructura narrativa interna de las tabs (las tabs siguen viéndose con su layout actual, solo con colores nuevos).
- No tocar el motor.
- No agregar funcionalidad nueva (potencia firme, Pareto, etc.).
- No subir PDFs de datasheets (eso es P3).

### Criterios de aceptación

- Build limpio (TS strict + Vite).
- 131 tests siguen pasando.
- Visualmente, al abrir cualquier tab en preview, se ve la paleta nueva (azul cobalto + teal + ámbar) con tipografía Inter y container 1080.
- Toggle cliente/técnico ya no existe.
- Tab nav inline tipo píldoras visible arriba de cada tab.
- Comparar con `tab_01_sfv.html` la barra de navegación — debe coincidir.

### Validación

- Abrir preview de Vercel y `docs/mockups/tab_01_sfv.html` lado a lado.
- La tab nav y los colores deben verse idénticos. Las tabs internas siguen con estructura vieja pero con la paleta nueva.

---

## P2 · Re-estructura Tab SFV al formato consultor

**Objetivo:** reemplazar las 5 secciones narrativas tipo pregunta del Tab SFV por la estructura ejecutiva del mockup `tab_01_sfv.html`. Conectar al motor existente y completar los gaps (bandas P25/P75, excedentes mensuales agregados, estadísticos de excedentes diarios).

**Estimación:** 60 min Claude Code.
**Rama:** `feature/tab-sfv-formato-ejecutivo`
**Depende de:** P1.

### Tareas

#### Parte A — Extender motor SFV

1. **Extender `calcularPerfilHorario` en `src/lib/core/sfv/`** para que devuelva también percentiles por hora del día:

   ```ts
   perfil_por_hora[h]: {
     kW_promedio, kW_maximo,
     kW_p25, kW_p75  // NUEVOS
   }
   ```

   Calcular P25 y P75 sobre todos los días del año para cada hora-ending.

2. **Crear helper `agregarExcedentesPorMes` en `src/lib/core/sfv/`:**

   ```ts
   agregarExcedentesPorMes(registros: RegistroHorario[], poi_kw: number): {
     mes: string;        // "2025-01"
     mes_label: string;  // "Ene"
     excedente_mwh: number;
   }[]
   ```

   El excedente horario es `max(0, gen_h - poi_kw)`. Suma por mes.

3. **Crear helper `estadisticasExcedenteDiario`:**

   ```ts
   estadisticasExcedenteDiario(registros: RegistroHorario[], poi_kw: number): {
     mediana_kwh: number;
     promedio_kwh: number;
     p75_kwh: number;
     p90_kwh: number;
     dia_critico_kwh: number;
     dia_critico_fecha: string;
   }
   ```

4. **Extender `agregarPorMes`** para que incluya columna `excedente_mwh` (reusando el helper anterior).

5. **Tests:** agregar tests para las 3 nuevas funciones. Validar contra targets esperados de Tequila 2025:
   - Excedente diario promedio ≈ 536 kWh
   - Excedente diario P90 ≈ 970 kWh
   - Excedente diario máximo ≈ 1,387 kWh
   - Excedente mensual marzo ≈ 29.5 MWh

#### Parte B — Re-estructurar UI del Tab SFV

6. **Reemplazar `src/pages/TabSFV.tsx`** (o como se llame el componente actual) replicando estructura de `tab_01_sfv.html`:

   a. **Tab nav** inline (ya creado en P1).

   b. **Header** con título "Análisis de la curva de generación del SFV — [nombre planta]" y chips de metadata (año base, registros, POI, zona LMP).

   c. **Banda de 4 KPIs principales** con `<KpiCard variant="primary">` para los dos primeros y `<KpiCard>` para los dos siguientes. Datos:
   - **Generación anual** · MWh · "365 días operativos" · tooltip: "Energía total entregada al POI durante el periodo. Suma de cincominutales reales × Δt."
   - **Factor de capacidad** · % · "sobre POI [X] kW" · tooltip: "Generación anual ÷ (POI × 8,760 h). Convención utility scale (DOE / IRENA)."
   - **Horas con generación** · h/año · "% del calendario" · tooltip: "Total de horas del año con generación instantánea ≥ 50 kW."
   - **Potencia promedio anual** · kW · "% del POI" · tooltip: "Potencia promedio durante horas con generación ≥ 50 kW. Indica el régimen típico de operación."

   d. **`<LecturaEjecutiva>`** con texto generado dinámicamente o template fijo (ver HTML).

   e. **Chart Perfil horario promedio anual** (Chart.js line):
   - Eje X: 24 horas (hora-ending 1..24, formato "01:00" .. "24:00").
   - Eje Y: kW.
   - Serie 1 (banda área): P25-P75, color `--color-generation` con opacidad 0.18, sin borde.
   - Serie 2 (línea sólida): promedio, color `--color-generation`, peso 2.5px.
   - Serie 3 (línea punteada): pico máximo del año, color `--color-baseline`, dash [4,4], peso 1.5px.
   - Leyenda manual arriba con 3 swatches cuadrados.

   f. **Chart Excedentes mensuales** (Chart.js bar):
   - Eje X: 12 meses (Ene..Dic).
   - Eje Y: MWh.
   - Barras color `--color-capture`, borderRadius 3.

   g. **Bloque "Distribución de excedentes diarios"** — grid de 4 mini-KPIs:
   - Mediana · kWh · tooltip: "Mediana del excedente diario. La mitad de los días el excedente fue menor a este valor."
   - Promedio · kWh · tooltip: "Promedio aritmético del excedente diario."
   - P90 · kWh · tooltip: "Percentil 90. Solo el 10% de los días supera este valor — útil para dimensionar capacidad de captura."
   - Día crítico · kWh · tooltip: "Excedente del día con mayor generación bruta del año."

   h. **Tabla resumen mensual** con columnas: Mes · Generación · Excedente · Pico · Días activos · Mejor día. `font-variant-numeric: tabular-nums`. Header `bg-secondary`.

   i. **`<MetodologiaDetalles>`** con texto:
   - Fuente de datos: 105,120 cincominutales SFV [planta] [año].
   - Cálculo de excedente: max(0, gen_h − POI_kWh) agregado por hora.
   - Factor de capacidad: generación anual ÷ (POI × 8,760 h). Convención utility scale.
   - Alcance: caracterización del recurso bajo CRE A/113/2024.

   j. **`<FooterEstandar>`** con fuente, versión, fecha.

7. **Selector temporal:**
   - Eliminar el selector global sticky.
   - **Conservar la funcionalidad** integrada inline en el Chart Perfil horario (un control compacto arriba a la derecha del chart con opciones: Año / Semestre / Trimestre / Mes / Semana / Día).
   - Default: Año completo.
   - Cuando cambia el período, el chart se recalcula con la sub-serie correspondiente.

### Criterios de aceptación

- 131+ tests pasan (los nuevos también).
- Visualmente coincide con `tab_01_sfv.html`.
- Banda P25-P75 visible en el perfil horario.
- 4 mini-KPIs de distribución de excedentes calculados desde motor (no hardcoded).
- Tabla mensual con columna Excedente.
- Selector temporal inline funcional, default Año.
- Cero estructura narrativa tipo pregunta.
- Cero toggle cliente/técnico.

### Validación

- Comparar lado a lado con `docs/mockups/tab_01_sfv.html`.
- Los números deben coincidir con la salida del motor SFV.

---

## P3 · Re-estructura Tab BESS al catálogo plano

**Objetivo:** simplificar el Tab BESS al formato catálogo del mockup `tab_02_bess.html`. La anatomía de energía y la recomendación dinámica que viven hoy en este tab se mueven a Tab SFV+BESS en P4.

**Estimación:** 35 min Claude Code.
**Rama:** `feature/tab-bess-catalogo`
**Depende de:** P1.

### Tareas

1. **Subir PDFs a `public/datasheets/`:**
   - `hypercube-plus.pdf`
   - `hypercube-max.pdf`
   - `hyperblock-iii.pdf`

2. **Reescribir `src/pages/TabBESS.tsx`** replicando estructura de `tab_02_bess.html`:

   a. **Header** con título "Catálogo de almacenamiento — Hyperstrong" y chips de metadata (LFP-314Ah, refrigeración líquida, UL9540A · IEC 62619, TC 20 MXN/USD).

   b. **`<LecturaEjecutiva>`** con texto:
   *"Tres plataformas disponibles cubriendo el rango de 125 kW a 2,500 kW por unidad. Para el portafolio de Soluciones MHG (POI ≤ 500 kW por planta), Cube Plus y Cube Max son las opciones aplicables; Block III queda fuera de escala para este caso de uso."*

   c. **Grid de 3 cards de equipo** usando `CATALOGO_HYPERSTRONG`:
   - Cube Plus y Cube Max con `border: 2px solid var(--color-primary)` y badge "Aplicable a Tequila" (o nombre de planta activa).
   - Block III sin badge.
   - Cada card: título, modelo, specs grid (Energía, Potencia, Eficiencia, Vida útil), meta (Configuración, Voltaje DC, Dimensiones, Peso, USD/unidad, USD/kWh), 2 botones (Ficha técnica primary, PDF outline).

   d. **Tabla comparativa lado a lado** con 10 parámetros (Energía nominal, Potencia nominal, Configuración celdas, Voltaje DC nominal, Eficiencia máxima, Temperatura operación, Vida útil declarada, Refrigeración, Capacidad paralelo, Costo USD/kWh).

   e. **`<MetodologiaDetalles>`** con parámetros de operación:
   - RTE 85% (sistema completo, no PCS aislado).
   - DoD 95%, SoC mínimo 5%, SoC inicial 5%.
   - Curva SOH 20 años según datasheet Hyperstrong (99.4% año 0 → 67.1% año 20).
   - Nota crítica: versión Cube Max 250 vs 430 kVA — por defecto 250 (conservador) hasta validar con proveedor.
   - TC 20 MXN/USD configurable por planta.

   f. **`<FooterEstandar>`**.

3. **Eliminar de este tab** (estos elementos se reubican en P4 Tab SFV+BESS):
   - Sección "Anatomía de energía" con parámetros PPA editables.
   - Selector de categoría.
   - Recomendación dinámica de equipo.
   - Gráficas comparativas (las que hay; se conserva solo la tabla comparativa).
   - Fichas detalladas con accordion (se simplifica a card + botón a PDF).

4. **Notas internas en código:**
   - Marcar con `// TODO P4: mover a Tab SFV+BESS` los componentes que se eliminan de aquí pero se reusarán en P4.
   - No borrar el código aún — moverlo a `_archive/` o dejarlo comentado para que P4 lo migre.

### Criterios de aceptación

- Tab BESS muestra solo catálogo + tabla comparativa + metodología.
- 3 PDFs descargables desde botones.
- Build limpio.
- 131+ tests pasan.
- Visualmente coincide con `tab_02_bess.html`.

---

## P4 · Tab SFV + BESS con anatomía, potencia firme y frente Pareto

**Objetivo:** completar el Tab SFV+BESS para que coincida con `tab_03_sfv_bess.html`. Incorpora la anatomía de energía movida desde Tab BESS, agrega cálculo de potencia firme, frente Pareto, matriz de barrido y ventanas operativas.

**Estimación:** 75 min Claude Code (puede dividirse en 4A motor + 4B UI si conviene).
**Rama:** `feature/tab-sfv-bess-completo`
**Depende de:** P2, P3.

### Parte A — Extender motor BESS

1. **Crear `calcularPotenciaFirme` en `src/lib/core/bess/`:**

   ```ts
   calcularPotenciaFirme(
     detalle: EstadoHorario[],
     ventana_punta: [number, number]
   ): {
     potencia_firme_kw: number;        // P80
     percentiles: { p50, p75, p80, p90, p95 };
     horas_descarga_efectivas: number;
   }
   ```

   Toma los kW descargados durante hora-punta cada día y calcula el P80 anual.

2. **Crear `barrerConfiguracionesBESS` en `src/lib/core/bess/`:**

   ```ts
   barrerConfiguracionesBESS(
     registros: RegistroHorario[],
     equipo_base: Equipo,
     multiplicadores: number[],      // [1, 2, 3, 4, 5]
     duraciones_h: number[],         // [2, 3, 4, 6]
     params: ParametrosPPA
   ): MatrizConfiguracion[]
   ```

   Para cada (kW × duración) ejecuta `simularDespachoArbitraje` y devuelve:
   - `kw, kwh, duracion_h`
   - `cargado_mwh, descargado_mwh, fraccion_capturada`
   - `potencia_firme_kw`
   - `ciclos_anuales`
   - `usd_kwh` (costo del equipo escalado)
   - `es_frente_pareto: boolean`

3. **Crear `calcularVentanasOperativas` en `src/lib/core/bess/`:**

   ```ts
   calcularVentanasOperativas(detalle: EstadoHorario[]): {
     ventana_carga: {
       inicio_promedio: string;
       fin_promedio: string;
       duracion_promedio_h: number;
     };
     ventana_descarga: {
       horas_hasta_medianoche_h: number;
       horas_para_vaciarse_h: number;
       margen_h: number;
       cabe_en_ventana: boolean;
     };
   }
   ```

4. **Tests** para las 3 funciones nuevas validando contra targets de Tequila (config 400 kW × 1,600 kWh):
   - Potencia firme ≈ 177 kW.
   - Frente Pareto contiene 400×4h.
   - Ventana de carga inicio ≈ 10:00, fin ≈ 15:00.

### Parte B — UI del Tab SFV+BESS

5. **Reescribir `src/pages/TabSFVBESS.tsx`** replicando estructura de `tab_03_sfv_bess.html`:

   a. **Header** con metadata (POI sin modificación, BESS configurado, hora punta CFE, año base).

   b. **`<ConfigBar>`** con potencia, energía, duración, estrategia, RTE + botón "Ajustar parámetros" (que abre modal o pop-over con los controles existentes de Módulo 5).

   c. **Banda de 4 KPIs principales:**
   - Energía cargada (variant capture)
   - Energía descargada (variant capture)
   - Potencia firme (variant primary)
   - Ingreso anual (variant primary) — **placeholder hasta P5**, mostrar "Pendiente (módulo financiero)" o tooltip de "Disponible en próxima iteración".

   d. **`<LecturaEjecutiva>`** dinámica según resultado de comparación greedy vs arbitraje.

   e. **Chart Despacho diario promedio** (Chart.js line + áreas, ver HTML):
   - Banda azul muy claro hora punta CFE.
   - Área ámbar generación SFV.
   - Área verde BESS cargando.
   - Área índigo BESS descargando.
   - Leyenda manual con 4 swatches.
   - Selector temporal inline (Año/Semestre/Trim/Mes/Semana/Día).

   f. **Bloque "Anatomía de energía"** (movido desde Tab BESS):
   - Parámetros PPA editables (compromiso mensual, ventana punta).
   - Tabla de 4 categorías con MWh y % (toda_energia, fuera_hora_punta_cfe, compromiso_ppa_mensual_mwh, exceso_capacidad_cfe_kw).
   - **Recomendación dinámica de equipo** según categoría seleccionada (con texto "Recomendación basada en captura potencial").

   g. **Sección "Comparativa de estrategias de despacho":**
   - Card izquierda Greedy en tono neutro.
   - Card derecha Arbitraje con `border: 2px solid var(--color-capture)`, badge "Recomendada", métricas resaltadas en `--color-capture-dark`.

   h. **Bloque "Ventanas operativas"** (2 cards):
   - Ventana de carga: inicio, fin, duración.
   - Ventana de descarga: horas hasta medianoche, horas para vaciarse, margen, badge verde/rojo "Cabe en ventana" / "Excede ventana".

   i. **KPI explícito "Pérdidas por eficiencia RTE":**
   - Valor: cargado − descargado.
   - Tooltip: "Pérdidas por eficiencia del ciclo de almacenamiento. Cargado × (1 − RTE)."

   j. **Sección "Barrido de configuraciones BESS — estrategia arbitraje":**
   - **Chart Frente Pareto** (Chart.js scatter):
     - Eje X: MWh capturados.
     - Eje Y: USD/kWh (reversed para que menor costo quede arriba).
     - Frente Pareto en `--color-capture` (puntos grandes).
     - Dominadas en gris (puntos pequeños).
     - Tooltip con label de cada configuración.
   - **Tabla del barrido** (6-12 filas) con la recomendada destacada con fondo verde claro.

   k. **`<MetodologiaDetalles>`** con supuestos.

   l. **`<FooterEstandar>`**.

### Criterios de aceptación

- Motor extendido con 3 funciones nuevas + tests.
- Tab SFV+BESS visualmente coincide con `tab_03_sfv_bess.html`.
- Anatomía de energía visible (movida de Tab BESS).
- Potencia firme calculada y mostrada.
- Frente Pareto interactivo (tooltip al hover).
- Ventanas operativas con badge.
- Pérdidas RTE explícitas.
- KPI "Ingreso anual" marcado como pendiente del módulo financiero.

### Validación

- Comparar lado a lado con `docs/mockups/tab_03_sfv_bess.html`.

---

## P5 · Motor financiero (sin UI)

**Objetivo:** construir el motor de cálculo financiero a 20 años sin tocar UI. Permite que P6 lo consuma cuando esté listo.

**Estimación:** 60 min Claude Code.
**Rama:** `feature/motor-financiero`
**Depende de:** P4.

### Tareas

1. **Crear `src/lib/core/financiero/`** con módulos:

   - `precios.ts` — defaults editables:
     ```ts
     export const PRECIOS_DEFAULT = {
       energia_mxn_mwh: 1010.80,           // proxy Estanzuela 2
       potencia_firme_mxn_mw_mes: 333334,
       cel_mxn: 190,
       tipo_cambio_mxn_usd: 20,
     };
     export const ASUNCIONES_DEFAULT = {
       wacc: 0.10,
       inflacion_anual: 0.04,
       escalacion_ppa_anual: 0.025,
       escalacion_potencia_anual: 0.025,
       escalacion_cel_anual: 0.02,
       degradacion_pv_anual: 0.005,
       horizonte_anos: 20,
     };
     export const CAPEX_PCTS = {
       instalacion: 0.15,
       ingenieria: 0.05,
       permisos: 0.03,
       contingencia: 0.05,
       opex_bess_anual: 0.015,
     };
     ```

   - `curva-soh.ts` — array de 21 valores Hyperstrong:
     ```ts
     export const CURVA_SOH_HYPERSTRONG = [0.9939, 0.9497, 0.9223, ..., 0.6708];
     ```

   - `capex.ts` — desglose:
     ```ts
     calcularCAPEX(equipo, multiplicador, pcts): {
       equipo_bess_usd, instalacion_usd, ingenieria_usd,
       permisos_usd, contingencia_usd, total_usd, total_mxn
     }
     ```

   - `flujo-caja.ts` — proyección 20 años:
     ```ts
     proyectarFlujo20Anos(
       config_bess, resultado_arbitraje, capex, precios, asunciones
     ): {
       año, soh, ingreso_energia, ingreso_potencia, ingreso_cels,
       ingreso_total, opex, fcl, acumulado, fcl_descontado
     }[]
     ```
     Aplica curva SOH × año + escalación de precios + degradación SFV.

   - `kpis-financieros.ts`:
     ```ts
     calcularVAN(flujos, wacc): number
     calcularTIR(flujos): number  // bisección numérica
     calcularPaybackSimple(flujos, capex): number
     calcularLCOS(capex, opex_serie, descarga_serie, wacc): number
     calcularSensibilidadTornado(config_base, variaciones): {
       parametro, delta_van_positivo, delta_van_negativo
     }[]
     ```

2. **Tests para todas las funciones:**
   - VAN sobre flujo conocido (validar manualmente con calculadora).
   - TIR sobre proyecto conocido.
   - Payback sobre flujo lineal.
   - LCOS sobre caso simple.
   - Sensibilidad: variar ±20% en cada parámetro y validar que Δ VAN es coherente con la dirección esperada.

3. **No tocar UI en este prompt.**

### Criterios de aceptación

- 5 módulos creados en `src/lib/core/financiero/`.
- Tests pasan.
- Sin cambios en UI.
- Build limpio.

---

## P6 · Tab Análisis financiero

**Objetivo:** implementar la última tab, replicando `tab_04_financiero.html` y consumiendo el motor de P5.

**Estimación:** 60 min Claude Code.
**Rama:** `feature/tab-financiero`
**Depende de:** P5.

### Tareas

1. **Crear `src/pages/TabFinanciero.tsx`** replicando estructura del HTML:

   a. **Header** con chips de metadata (horizonte, WACC, inflación, TC).

   b. **`<ConfigBar>`** con equipo, configuración, estrategia, SOH 20 años (lectura, no editable aquí; se edita en Tab SFV+BESS).

   c. **Banda de 4 KPIs principales** con tooltips y badges:
   - VAN ($X.X M MXN) · variant primary · badge "Crea valor" / "Destruye valor"
   - TIR (XX.X %) · variant primary · badge "+X.X pp vs WACC"
   - Payback simple (X.X años) · variant capture · badge "Rápido / Razonable / Lento"
   - LCOS ($X,XXX MXN/MWh) · variant capture · sublabel "vs PPA $X,XXX"

   d. **`<LecturaEjecutiva>`** dinámica.

   e. **Sección CAPEX:**
   - Donut chart (Chart.js doughnut) con composición (Equipo, Instalación, Ingeniería, Permisos, Contingencia).
   - Tabla breakdown al lado con totales en USD y MXN.

   f. **Chart "Flujo de caja 20 años"** (Chart.js bar stacked):
   - Eje X: Año 1 a Año 20.
   - Series positivas apiladas: Energía (ámbar), Potencia firme (azul), CELs (verde).
   - Serie negativa: OPEX (rojo).

   g. **Chart "Sensibilidad tornado"** (Chart.js horizontal bar):
   - 5 filas: Potencia firme ±30%, Precio energía ±20%, CAPEX ±15%, WACC 8-12%, OPEX ±25%.
   - Variación positiva en verde captura, negativa en rojo pérdida.

   h. **Tabla flujos anuales** (21 filas, Año 0 a Año 20):
   - Año 0: CAPEX negativo.
   - Años 1-20: SOH, Ingreso, OPEX, FCL, Acumulado, FCL descontado.
   - Año de payback con fondo verde claro.

   i. **`<MetodologiaDetalles>`** con horizonte, WACC, escalaciones, TIR por bisección, LCOS por sumatoria descontada, nota sobre precios proxy Estanzuela 2.

   j. **Panel "Parámetros editables"** colapsable (o modal) que permite ajustar precios, WACC, escalaciones, CAPEX %s, OPEX % — todo persistido en localStorage `dimensionamiento-bess:parametros-financieros`.

   k. **`<FooterEstandar>`**.

2. **Actualizar Tab SFV+BESS** para reemplazar el placeholder "Ingreso anual — pendiente" por el valor real calculado.

### Criterios de aceptación

- Tab visible y funcional.
- Consume motor de P5 sin hardcoded.
- Visualmente coincide con `tab_04_financiero.html`.
- Donut, stacked bar y tornado renderizan correctamente.
- Parámetros editables persistidos.
- KPI Ingreso anual en Tab SFV+BESS ahora muestra dato real.

---

## Pendientes que NO están en estos 6 prompts

1. **Tab Resumen ejecutivo** — diseñada conceptualmente; el HTML formal no está. Se agrega como P7 después de validar las 4 tabs base.
2. **Tabla del portafolio de 13 plantas** — módulo de selección de planta a nivel app.
3. **Reporte exportable (docx)** — Módulo 4 del plan original.
4. **Conversación con Lalo sobre escenarios Wave 1 vs Wave 2.**
5. **Validaciones con cliente real:**
   - Precios PPA reales Tequila.
   - Regla CFE potencia firme.
   - WACC interno MHG.
   - Cotización Hyperstrong vigente.
   - Versión Cube Max (250 vs 430 kVA).
   - Frontera del PPA (cubre MDA o todo el MTR).

---

## Anexo · Orden de ejecución y dependencias

```
P1 (sistema diseño) ──┬─→ P2 (Tab SFV ejecutivo)
                      │
                      ├─→ P3 (Tab BESS catálogo)
                      │
                      └─→ P2 + P3 ───→ P4 (Tab SFV+BESS completo) ───→ P5 (motor financiero) ───→ P6 (Tab financiero)
```

**Tiempo total estimado:** ~5.5 horas de Claude Code distribuidas en 6 PRs durante 3-4 días con validación visual de Rodrigo entre cada uno.

**Tiempo de cada prompt:** 35-75 min, ninguno excede el límite de contexto cómodo de Claude Code (lección aprendida del PR #13 grande).

---

*Fin del documento. Listo para subir a `dimensionamiento-bess` como `docs/REFACTOR_ROADMAP.md` y ejecutar prompt por prompt.*
