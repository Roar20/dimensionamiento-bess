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

## Módulo 3 — Tab BESS (catálogo Hyperstrong)

Toda la copy del Tab BESS vive en `src/lib/copy/modulo-3.ts` bajo `COPY_M3`.

### Página
- Título: "Catálogo de equipos BESS".
- Subtítulo: "Sistemas de almacenamiento Hyperstrong disponibles para tu SFV."

### Estructura reordenada (post-fix)

1. Intro.
2. **Anatomía de la energía (nueva)** — captura de parámetros PPA + 4 categorías + selector + bloque puente.
3. Equipos disponibles — narrativa cambia según categoría seleccionada.
4. Comparativa técnica.
5. Comparativas visuales.
6. Fichas técnicas detalladas.

### Sección 2 — Anatomía de la energía

- Título: "2. ¿Cuánta energía podríamos almacenar de tu SFV?"
- Intro: "Tu SFV genera {N} MWh al año. La pregunta es: ¿cuánto de eso es energía técnicamente almacenable? La respuesta depende de tu PPA."
- **Parámetros de tu PPA** — compromiso mensual (sugerido: promedio mensual del SFV), ventana hora-punta CFE (default 18-22h), capacidad CFE (read-only del onboarding). Botón "Restaurar valores sugeridos".
- **Anatomía de tu energía** — 4 categorías como barras horizontales con tooltip extendido.
- **Selector de categoría** — radios con "Aún no sabemos" como default + las 4 categorías con su MWh/año y % del SFV.
- **Bloque puente** — "Energía a almacenar para la recomendación de equipo": categoría seleccionada + total (o rango si "Aún no sabemos").

### Sección 1 — Intro
Bloques "¿Qué hace un BESS?", "¿Por qué importa para tu SFV?", lista de las 3 familias. Diagrama SVG: `SFV (genera de día) → BESS (almacena) → Red CFE (hora-punta 18-22 h)`.

### Sección 2 — Catálogo
- Sin planta: "Carga una planta para recibir una sugerencia de equipo óptimo."
- Con planta: la razón generada por `recomendarEquipoOptimo` + "El dimensionamiento exacto … se calcula en el Tab SFV + BESS."
- Card del equipo recomendado tiene badge "Punto de partida sugerido".

### Sección 3 — Comparativa técnica
Tabla con 19 filas base (potencia, energía, duración, RTE, vida útil, batería, configuración, voltaje, rango voltaje, temperatura, dimensiones, huella, peso, IP, refrigeración, comunicaciones, precio, costo unitario, densidad). Vista técnica añade fila "Certificaciones".

### Sección 4 — Comparativas visuales
4 BarChart en grid 2×2: Potencia, Energía, Densidad, Costo unitario. Barra del recomendado en `--color-primary`, resto en gris neutro.

### Sección 5 — Fichas detalladas
Accordion con datos por grupo (potencia/energía, batería, ambiente, físicas, conectividad, comercial). Botón "Descargar datasheet (PDF)" / "Datasheet próximamente" / "Verificando…" según disponibilidad detectada con `fetch HEAD`.

## Módulo 5 — Tab SFV + BESS

Toda la copy del Tab SFV+BESS vive en `src/lib/copy/modulo-5.ts` bajo `COPY_M5`.

### Hero narrativo (siempre visible)
- Título: "El valor del BESS sin tocar tu permiso CFE".
- Cuerpo: explica que el BESS no modifica la capacidad CFE; solo mueve la energía en el tiempo.

### Selector temporal global con 6 granularidades
- Anual, Semestral, Trimestral, Mensual, **Semanal** (nueva en este tab), Diario.

### Selector de categoría compacto (arriba de la Sección 2)
- "Categoría de energía a analizar:" + dropdown con "Energía fuera de hora-punta CFE (referencia)" como valor para "ninguna" + las 4 categorías nombradas.

### Sección 1 — Tu configuración del BESS
- 3 cards de equipo (II Plus / II Max / Block III), badge "Recomendado" en la sugerida.
- Multiplicador 1-20 unidades en paralelo.
- KPIs derivados: Potencia total, Capacidad total, Duración nominal, Inversión estimada.

### Sección 2 — Anatomía de captura
- 4 cards (una por categoría). Cada card: nombre + descripción + MWh disponibles + columna greedy + columna arbitraje (con horas en punta).
- Alerta amarilla cuando la categoría tiene <1 MWh capturable.

### Sección 3 — Despacho diario promedio
- Dos cards lado a lado (Greedy / Arbitraje). Gráfica composada con SFV, carga, descarga (áreas) y SoC (línea dasheada, eje secundario).
- Banda hora-punta CFE marcada.
- Insight final: "La estrategia arbitraje concentra la descarga en hora-punta…".

### Sección 4 — Captura por periodo
- BarChart (cargado + descargado) + línea de energía categoría disponible.
- Eje X cambia según granularidad: meses en anual/semestral/trimestral, días en mensual, días de la semana en semanal, horas en diario.

### Sección 5 — Comparativa de estrategias
- Tabla 5 filas: cargado total, descargado total, ciclos, horas de descarga en punta, energía descargada en punta.
- Banner verde con recomendación dinámica ("Arbitraje entrega X× más energía en hora-punta…").

### Sección 6 — Resumen ejecutivo
- 5 bullets generados dinámicamente con los números del periodo activo.
- CTA hacia análisis financiero (botón deshabilitado hasta Módulo 6).

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

---

## Tab BESS — Costo Unitario (PR P5)

Espejo editorial. Implementación en `src/lib/copy/modulo-3.ts` bajo `COPY_M3.costoUnitario`.

- **Eyebrow:** "Costo de capacidad"
- **Título:** "Costo unitario por kWh nominal"
- **Subtítulo:** "USD por kWh de capacidad nominal declarada · equipos aplicables a Tequila."
- **Headline (24px/700):** "El Cube Max cuesta 17% menos por kWh que el Cube Plus."
- **Chip base:** "Base: capacidad nominal"
- **Chip sensibilidad:** "Sensibilidad DoD 95% en tooltip y metodología"
- **Tooltip de barra:** `Nominal $214 · con DoD 95% ≈ $225` (Cube Plus) / `Nominal $177 · con DoD 95% ≈ $186` (Cube Max).
- **Tira Block III (utility, fuera de comparación):** "$113 USD/kWh — Escala utility — no compite para POI 500 kW · Tag: Fuera de escala".
- **Metodología:** sección dentro del `<details>` técnico con tres párrafos (base nominal, sensibilidad DoD, exclusión Block III).

## Tab BESS — Degradación SOH (PR P5)

Espejo editorial. Implementación en `src/lib/copy/modulo-3.ts` bajo `COPY_M3.degradacionSoh`. Migración incremental sobre la sección existente; no es rediseño.

- **Headline ejecutivo (24px/700):** "La batería mantiene más del 80% de su capacidad hasta cerca del año 9."
- **Línea de asimetría (debajo, sin números crudos):** "La pérdida se concentra en los primeros años y se atenúa después."
- **Subtítulo (limpiado de C-rate):** "Retención de capacidad (SOH, State of Health) según la curva declarada por Hyperstrong para la familia LFP-314Ah, en condiciones nominales del datasheet."
- **KPI cards (solo 2 anclas):** "SOH año 0 — Entrega" y "SOH año 20 — Fin del horizonte modelado".
- **Dos umbrales en la curva (con etiquetas distintas):** 80% = fin de vida útil de referencia (≈ año 9); 70% = umbral de garantía contractual típico (≈ año 16).
- **Callout sobre la curva en el cruce del 80%:** título "Fin de vida útil de referencia" + subtítulo "Año 9 · 80% capacidad".
- **Tabla 21 filas — solo seis hitos:** años 0, 9, 12, 15, 16, 20. Demás filas con "—". Cube Max en año 12 y Cube Plus en año 15 (consistente con tarjetas).
- **Disclaimer ámbar (compacto, neutral sobre C-rate):** carta formal de garantía como pendiente de confirmación con Hyperstrong; mantiene mención de desviaciones operativas (temperatura, ciclado, sobre-corriente, tasa de carga/descarga) sin afirmar valores específicos de C-rate.
- **Hitos prohibidos (eliminados de la migración):** "Cierre asentamiento" (año 1), "Primer lustro" (año 5), "Punto contractual garantía" (año 10).
- **Afirmaciones prohibidas:** valores específicos de C-rate (1C, 0.5C). Se mencionan factores generales sin numerar.
