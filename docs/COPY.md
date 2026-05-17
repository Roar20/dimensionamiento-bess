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
