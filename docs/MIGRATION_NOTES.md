# Notas de migración visual (P1 → P6)

Este documento rastrea los **TODOs visuales** que P1 dejó pendientes
intencionalmente para que los cierre el prompt correspondiente.

## Deuda visual aceptada en P1

P1 reskinó tokens, shell, tab nav y agregó componentes base, pero **no
tocó la estructura interna de las tabs**. Los siguientes elementos
quedan visualmente "fuera de marca" temporalmente hasta que P2-P6 los
reescriban:

### Tab SFV (P2 lo reescribe)
- 5 secciones narrativas tipo pregunta (`Seccion1Generacion`,
  `Seccion2PerfilDiario`, etc.).
- `KPICard` propio del módulo (`tab-sfv/KPICard.tsx`) con ícono Info
  separado del nuevo `KpiCard` corporativo. P2 migra al nuevo.
- `NarrativaIntro` con título grande tipo storytelling.
- `SelectorTemporal` sticky global (los mockups lo quieren inline en
  charts específicos).

### Tab BESS (P3 lo reescribe)
- `Seccion1IntroBESS` con diagrama SVG SFV → BESS → Red.
- `Seccion2EnergiaAlmacenable` con anatomía de energía y parámetros
  PPA editables. P3 elimina esta sección de Tab BESS; P4 la mueve a
  Tab SFV+BESS.
- `Seccion2Catalogo` con cards de equipo (estilo propio, no mockup).
- `Seccion4GraficasComparativas` y `Seccion5FichasDetalladas`. El
  mockup `tab_02_bess.html` los elimina en favor de la tabla
  comparativa plana.

### Tab SFV+BESS (P4 lo reescribe)
- `HeroNarrativo` navy gradient. P4 elimina el hero y reemplaza por
  config bar + KPIs.
- 6 secciones narrativas. El mockup las simplifica.
- Falta potencia firme, frente Pareto, matriz de barrido (P4 los
  agrega al motor y a la UI).

### Tab Análisis financiero (P6)
- No existe todavía. P6 lo crea desde cero consumiendo el motor
  financiero de P5.

## Iconos: coexistencia temporal

- **Tabler Icons webfont** cargado vía CDN en `index.html`. Disponible
  para todos los componentes nuevos (`<i class="ti ti-..."></i>`).
- **lucide-react** sigue instalado y usado por los componentes
  pre-existentes que P1 no reescribió (selectores, dialogs, KPI cards
  del Módulo 2, etc.).
- P2-P6 migrarán los iconos completamente cuando reescriban cada tab.
  Cuando ya no haya consumidores de `lucide-react`, removerlo del
  `package.json`.

## Iteración Tab SFV · estructura ejecutiva (P2)

Reescribió el Tab SFV completo al formato consultor del mockup
`tab_01_sfv.html`. Eliminadas 5 secciones narrativas tipo pregunta + el
selector temporal sticky global del Tab SFV. Sustituidas por header
dossier + 4 KPIs + Lectura ejecutiva + Perfil horario (Chart.js con
banda P25-P75 y selector inline) + Excedentes mensuales (Chart.js bar
locked a año) + 4 mini-KPIs + Tabla mensual + Metodología.

### Decisiones de scope

- **Selector temporal inline solo en Perfil horario.** El chart de
  Excedentes mensuales se mantiene locked a "año completo" (el mockup
  no lo muestra con selector y agregar uno desnaturaliza la vista
  comparativa mes-a-mes).
- **KPIs ejecutivos sobre dataset anual** (no se mueven con el selector
  inline). Son "estado del activo" — convención dashboards consultor.
- **`usePeriodoActivo` global persistido NO se toca** (lo siguen usando
  Tab BESS y Tab SFV+BESS). Se introdujo un hook local `usePeriodoInline`
  para el selector del Perfil horario, sin persistencia en localStorage.

### Charts: Chart.js + react-chartjs-2 (coexistencia con Recharts)

P2 instaló `chart.js@^4.4` + `react-chartjs-2@^5.2`. **Recharts sigue
instalado** porque Tab BESS y Tab SFV+BESS aún lo consumen vía
`TooltipRecharts.tsx`, `Seccion3Variabilidad`, etc. Sweep completo
(uninstall recharts, migrar tabs restantes a Chart.js) es deuda para
P3/P4. Mientras tanto el bundle carga ambas librerías. Anotado para
seguimiento.

### Componentes "tab-sfv" que sobreviven como utilidades compartidas

Los siguientes archivos del directorio `src/components/tab-sfv/`
**ya no son consumidos por Tab SFV**, pero permanecen porque Tab BESS y
Tab SFV+BESS los importan:

- `NarrativaIntro.tsx` — consumido por 7 secciones de Tab BESS y Tab
  SFV+BESS. P3/P4 eliminan al reescribir.
- `SelectorTemporal.tsx` — consumido por `TabSFVBess.tsx`. P4 elimina.
- `TooltipRecharts.tsx` (+ test) — consumido por `Seccion3Variabilidad`,
  `Seccion4Heatmap` (Tab SFV — pero estos ya no se montan), y por
  `GraficaComparativa` (Tab BESS) + `GraficaDespacho` (Tab SFV+BESS) +
  `Seccion4CapturaPorPeriodo` (Tab SFV+BESS). P3/P4 los reemplazan.

Cuando P4 cierre, mover estos archivos a una ubicación neutral (ej.
`src/components/charts-legacy/`) o eliminarlos definitivamente.

### Encabezado contextual chrome global (Q ABIERTA)

El `EncabezadoContextual` (chrome global de P1, `AppShell.tsx`) sigue
renderizándose arriba del Tab SFV con el strip
`Tequila · 500 kW PV · 500 kW POI · 8,760 registros · cargado …`. Esto
**duplica info** con el nuevo `HeaderDossier` del Tab SFV (POI,
registros, año base) y **no aparece en el mockup `tab_01_sfv.html`**.

Tres rutas posibles, todas pendientes de decisión:
- (A) Dejar como está. "Cambiar planta" sigue accesible arriba.
  Pixel-perfect imposible.
- (B) Sacar `EncabezadoContextual` de `AppShell` y dejar que cada tab
  decida si lo renderiza. SFV no, BESS sí, SFV+BESS sí. "Cambiar
  planta" se mueve a `HeaderDossier` esquina derecha discreta.
- (C) `AppShell` route-aware: ocultar el strip solo en `/sfv`.

P2 deja la decisión abierta. Acción de seguimiento.

## Iteración onboarding · registro consultor (post-P1)

Reescribimos el onboarding (`/`) al registro consultor seco. Para mantener
el blast radius mínimo, dos componentes quedan **no renderizados** pero
**sin eliminar**:

- **`src/components/onboarding/CajaComoFunciona.tsx`** — caja didáctica
  "Cómo funciona" con 3 pasos explicativos. Se quitó del montaje en
  `Onboarding.tsx` por chocar con el registro consultor (tono tutorial).
  El archivo `.tsx` y la clave `COPY_M1A.como` se conservan por si se
  rescata en presentaciones futuras (deck inicial, modal de ayuda, etc.).
  Candidato a eliminación si no se rescata en P2-P6.
- **`src/components/onboarding/ResumenCarga.tsx`** — vista alternativa con
  Hero navy + KPIs cuando hay datos persistidos. Hoy `Home.tsx` redirige
  a `/sfv` cuando `datos != null` antes de que `ResumenCarga` se monte,
  por lo que en la práctica nunca se renderiza. Candidato a verificación
  de código muerto durante P2/P3 (cuando se reescriba el flujo de carga
  / cambio de planta). No tocado en esta iteración.

## Componentes obsoletos eliminados en P1

- `src/components/shell/AppHeader.tsx` — reemplazado por `<TabNav>`
  inline en cada página.
- `src/components/shell/ViewToggle.tsx` — toggle Vista cliente/técnico
  eliminado por decisión de producto.
- `src/context/ViewModeContext.tsx` — ya no se necesita.
- `src/components/tab-sfv/BloqueTecnico.tsx` (+ `.test.tsx`) —
  reemplazado por `<MetodologiaDetalles>` siempre visible.

## Tokens: alias legacy

`src/index.css` mantiene aliases de los tokens viejos
(`--color-header-bg`, `--color-card-border`, `--color-primary-hover`,
etc.) apuntados a los nuevos valores corporativos. Tailwind
(`tailwind.config.ts`) sigue exponiendo las clases `brand-*`,
`ink-*`, `action`, `info-*`, `status-*` para que los componentes
existentes sigan funcionando con el nuevo look sin necesidad de
sweep clase por clase.

Cuando P2-P6 reescriban cada tab, migrar las clases a las nuevas
`corp-*` (`corp-primary`, `corp-capture`, etc.) y eliminar los aliases
del tailwind config.

## Fuente

P1 carga **Inter** vía Google Fonts (CDN en `index.html`, pesos 400 y
500). El paquete `@fontsource-variable/inter` se eliminó de
`package.json`. Si la app necesita funcionar offline en algún
momento, restaurar el paquete y volver a importarlo desde `main.tsx`.

## Tipografía: `font-semibold` y `font-bold` prohibidos

P1 sweepeó todos los `font-semibold` y `font-bold` de `src/**/*.tsx`
(excepto tests) a `font-medium`. Si algún componente nuevo necesita
peso 600+, **es una violación del sistema de diseño** — el mockup
nunca usa más de 500. Antes de agregar `font-bold`, revisar si lo
que se quiere lograr puede resolverse con tamaño o color.
