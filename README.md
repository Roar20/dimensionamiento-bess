# dimensionamiento-bess
Dimensionamiento de BESS para plantas fotovoltaicas existentes. Captura excedentes y desplaza energía a hora punta sin modificar el permiso de interconexión CFE.
# dimensionamiento-bess

Herramienta de análisis y dimensionamiento de sistemas de almacenamiento de energía 
en baterías (BESS) para plantas fotovoltaicas existentes en México, bajo el marco 
regulatorio CRE A/113/2024.

## Alcance

Esta aplicación modela el comportamiento técnico-económico de agregar un BESS a un 
sistema fotovoltaico (SFV) ya construido y operando, **sin modificar la capacidad 
autorizada de interconexión ante CFE**.

El BESS captura energía que el SFV genera dentro de su permiso vigente y la 
desplaza a hora punta para maximizar el ingreso del propietario.

## Qué hace

- Analiza la curva de generación real del SFV existente.
- Cuantifica excedentes disponibles para captura por BESS.
- Dimensiona la capacidad óptima del BESS (kW × kWh).
- Simula el despacho diario (carga durante el día, descarga en hora punta CFE).
- Compara estrategias greedy vs arbitraje.
- Calcula el retorno económico bajo el contrato PPA y precios del mercado.

## Qué NO hace

- **No modela ampliación de capacidad del SFV.** El SFV se asume fijo en su 
  capacidad CFE autorizada. No hay "PV adicional", "overbuild", ni "PV total 
  proyecto".
- **No requiere trámite ante CFE.** Bajo CRE A/113/2024, el BESS no cuenta como 
  capacidad contratada adicional.
- **No reemplaza el análisis financiero formal** que debe acompañar la decisión 
  de inversión. Es una herramienta de dimensionamiento técnico-económico.

## Glosario

- **SFV**: Sistema Fotovoltaico. Nunca usar "PV" o "planta solar" en el UI.
- **POI**: Punto de Interconexión. Capacidad autorizada por CFE (fija).
- **BESS**: Battery Energy Storage System.
- **Excedentes del SFV**: Energía generada por el SFV no monetizada por el PPA, 
  disponible para captura por BESS.
- **Hora punta CFE**: 18:00–22:00 horas. Ventana de máximo valor para descarga.

## Stack técnico

- Vite + React 18 + TypeScript
- Tailwind + shadcn/ui
- Recharts (visualizaciones)
- xlsx (lectura/escritura Excel)
- TanStack Query + localStorage (sin backend)

## Estado

Proyecto en desarrollo activo. Piloto: planta Tequila 1, portafolio Soluciones MHG.
