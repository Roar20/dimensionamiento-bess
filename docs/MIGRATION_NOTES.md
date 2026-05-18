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
