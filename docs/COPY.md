# Copy oficial de la app

Documento fuente de toda string visible al usuario. Ningún componente debe tener strings hardcodeados; todos importan de constantes que se declaran en código, derivadas de este documento.

## Reglas de redacción

1. Tooltip universal en cada KPI: etiqueta + sublabel (unidad y periodo) + tooltip explicativo.
2. Unidades completas en cada número grande: periodo de cobertura y tipo de medición.
3. Sin siglas técnicas en UI principal: POI, LMP, MDA, MTR, RTE, DoD, SOC, SOH, PPA, CEL, BESS se traducen. Glosario aparte.
4. Cada tab abre con párrafo explicativo de 2-3 líneas.
5. Números traducidos a lenguaje humano cuando sea posible.
6. Errores en humano: nunca exponer estado interno.
7. Toggle Vista cliente / Vista técnica: cliente por default.
8. Iconografía clara: nunca íconos solos, siempre con etiqueta.
9. Color con significado: verde = bueno, rojo = pérdida real, amarillo = advertencia, azul = info.

## Módulo 1A — Onboarding del proyecto

Toda la copy del onboarding vive en `src/lib/copy/modulo-1a.ts` bajo la constante `COPY_M1A`. Ningún string del onboarding está hardcodeado en JSX.

### Hero

- **Título:** "Simulador BESS — Onboarding del proyecto".
- **Subtítulo:** "Sube el reporte de generación del cliente y configura los parámetros contractuales de la planta."

### Sección 1 — Datos del cliente

- **Descripción:** "Identifica la planta y, si quieres, agrega el cliente y la ubicación."
- Campos: `Nombre de la planta` (requerido), `Cliente`, `Ubicación`.
- Cada campo trae helper text bajo el input.

### Sección 2 — Parámetros contractuales

- **Descripción:** "Capacidad autorizada por CFE, capacidad instalada actual y, si lo tienes, el precio del contrato PPA."
- Campos: `Capacidad autorizada por CFE (kW)` (requerido), `Capacidad instalada actual (kW)` (requerido), `Zona LMP`, `Precio PPA (MXN/MWh)` (opcional, no bloquea el flujo).

### Sección 3 — Archivo de generación

- **Descripción / formato:** "Formato esperado: Excel (.xlsx) con las columnas Día de Operación, Hora (1-24) y Energía Registrada [MWh]. Reporte anual o mensual."
- **Dropzone:** "Arrastra el archivo aquí o haz clic para seleccionar" + botón "Seleccionar archivo".
- **Error formato:** "El archivo debe ser un Excel (.xlsx). Selecciona otro archivo."

### Botones de acción

- **Procesar:** "Procesar y ver reporte" / "Procesando archivo…".
- **Cargar análisis anterior:** visible si hay datos persistidos.
- **Borrar datos guardados:** texto plano, abre confirmación. Título: "¿Borrar los datos guardados?". Descripción: "Vamos a eliminar la configuración y el archivo persistidos en este navegador. Esta acción no se puede deshacer."

### Caja "Cómo funciona"

Tres pasos numerados, exactos según `COPY_M1A.como.pasos`.

### Resumen tras carga

- **Título:** "Análisis cargado".
- **Subtítulo:** "Estos son los datos persistidos en este navegador. Puedes seguir trabajando o cargar otra planta."
- **KPIs:** Año del reporte, Energía anual generada (MWh), Horas con generación, Pico horario (kW). Cada KPI lleva label + sublabel + unidad cuando aplica.

## Módulo 2 — Tab SFV (análisis de la curva de generación)

Toda la copy del Tab SFV vive en `src/lib/copy/modulo-2.ts` bajo `COPY_M2`.

### Encabezado contextual y modal "Cambiar planta"
- Botón header: "Cambiar planta".
- Modal: título "¿Quieres cambiar de planta?", descripción "Los datos actuales se reemplazarán al cargar el nuevo archivo.", botones "Cancelar" y "Continuar".

### Selector temporal
- Label: "Periodo:" + flechas anterior/siguiente + dropdown del periodo + radios "Anual" / "Semestral" / "Trimestral" / "Mensual" / "Diario".
- Etiquetas semestrales: `S1 2025 (ene–jun)`, `S2 2025 (jul–dic)`.
- Etiquetas trimestrales: `Q1 2025 (ene–mar)`, `Q2 2025 (abr–jun)`, `Q3 2025 (jul–sep)`, `Q4 2025 (oct–dic)`.

### Tooltips de bloques técnicos
- Sección 1: HSE + factor de capacidad.
- Sección 2: clipping físico (definición y cuándo aparece).
- Sección 3: histograma de variabilidad.
- Sección 4: matriz numérica del heatmap.

### Sección 1 — ¿Cuánto genera tu SFV en {periodo}?
- KPIs: Energía generada (MWh), Horas con generación, Potencia promedio anual del SFV (kW + % del POI), Factor de planta (%).
- Tooltips con criterio CFE (factor típico SFV México 18-25%).
- Bloque técnico: HSE, Factor de capacidad PV, Días analizados.

### Sección 2 — ¿Cuándo genera durante el día?
- Gráfica horaria: kW promedio + kW máximo + banda "Hora-punta CFE" (18-22h) + referencia POI.
- KPI: "Energía generada durante hora-punta CFE".
- Bloque técnico: tabla 24 horas + diagnóstico de clipping.

### Sección 3 — ¿Cómo varía día a día?
- Serie diaria de barras con referencia "Promedio" y "P10".
- KPIs: Mejor día, Peor día, Promedio diario, Variabilidad, Días anómalos.
- Bloque técnico: histograma de días por rango de MWh.

### Sección 4 — ¿Cuándo genera más, hora por hora y día por día?
- Heatmap día×hora (SVG custom, escala YlOrRd).
- Selector de mes interno (granularidad Anual).
- Granularidad Diaria: curva del día seleccionado.
- Bloque técnico: matriz numérica (kW).

### Sección 5 — Resumen mensual (solo granularidad Anual)
- Tabla 12 filas: Mes, Energía (MWh), Pico horario (kW), Días con generación, Hora pico promedio, Mejor día, Peor día.
- Bloque técnico: botón "Exportar CSV".

### Periodo sin datos
- "No hay generación registrada el {fecha}. Selecciona otro día o cambia la granularidad." + botón "Ver día anterior con datos".

## Glosario de KPIs

_Pendiente: se llenará por tab en módulos siguientes._

## Tabs

### Tab 1 — Análisis de la curva de generación del SFV

_Pendiente._

### Tab 2 — Catálogo BESS

_Pendiente._

### Tab 3 — Análisis del SFV + BESS

_Pendiente._

### Tab 4 — Análisis financiero

_Pendiente._
