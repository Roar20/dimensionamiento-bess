# Marco regulatorio aplicable — Sistemas de Almacenamiento de Energía Eléctrica

**Última actualización:** 17 de mayo de 2026
**Proyecto:** Dimensionamiento BESS Soluciones MHG
**Aplicable a:** todas las plantas del portafolio operando bajo régimen SEN (Sistema Eléctrico Nacional, México)

---

## 1. Regulación vigente

### 1.1 Disposiciones Administrativas de Carácter General para la integración de Sistemas de Almacenamiento de Energía Eléctrica (SAEE) al Sistema Eléctrico Nacional

- **Emisor:** Comisión Nacional de Energía (CNE)
- **Publicación:** Diario Oficial de la Federación, 16 de abril de 2026
- **Vigencia:** a partir del 17 de abril de 2026
- **Reemplaza:** Acuerdo CRE A/113/2024 (DOF 7 de marzo de 2025) — abrogado

### 1.2 Disposiciones sobre mecanismos de adquisición de Energía, Potencia y Productos Asociados

- **Emisor:** CNE / CENACE
- **Publicación:** Diario Oficial de la Federación, 3 de abril de 2026
- **Aplicación:** habilita al CENACE para adquirir Energía, Potencia y Productos Asociados de centrales eléctricas y sistemas de almacenamiento privados bajo modelo dinámico basado en pronósticos de demanda, condiciones climatológicas y contingencias operativas.

### 1.3 Modelo de contrato de interconexión para BESS

- **Emisor:** CNE
- **Publicación:** Diario Oficial de la Federación, 17 de marzo de 2026
- **Aplicación:** establece esquema contractual específico para interconexión de SAEE a la red, con CFE como contraparte obligatoria y CENACE como coordinador técnico.

---

## 2. Cambios clave respecto al régimen anterior

| Concepto | Régimen anterior (CRE A/113/2024) | Régimen vigente (CNE abril 2026) |
|---|---|---|
| **Autoridad** | Comisión Reguladora de Energía (CRE) | Comisión Nacional de Energía (CNE) |
| **Status** | Abrogado | Vigente |
| **Naturaleza del BESS** | Apéndice de generación | Sujeto regulado propio (figura "almacenadora") |
| **Permisos** | Esquema general | Diferenciado entre configuraciones asociadas y no asociadas |
| **Tope sin permiso (Generación Distribuida)** | 0.5 MW | 0.7 MW |
| **Criterio potencia firme** | Capacidad nominal y reglas generales | Disponibilidad de Entrega Física (DEF) con duración mínima estandarizada |

---

## 3. Cálculo de Potencia Firme bajo régimen CNE 2026

> **Estado de verificación:** las características descritas en esta sección provienen de fuentes secundarias especializadas. Pendiente confirmación contra texto completo del DOF del 16 de abril de 2026.

### 3.1 Características reportadas

1. **Requisito de duración mínima:** el SAEE debe demostrar capacidad de inyectar energía continua durante un mínimo de **4 horas** a potencia nominal.

2. **Fórmula referida para Potencia Firme:**

   $$P_{firme} = \frac{E_{almacenable} \times \eta_{descarga}}{4 \text{ horas}}$$

   Donde:
   - `E_almacenable` = capacidad útil del BESS (kWh) tras aplicar DoD y SOH
   - `η_descarga` = eficiencia de descarga (típicamente √RTE o el lado de descarga del round-trip efficiency)

3. **Disponibilidad de Entrega Física (DEF):** el CENACE mide la potencia acreditada como el promedio de inyección durante las **100 Horas Críticas del SEN** del año en curso.

4. **Ajuste por degradación:** aplicación de Factor de Degradación anual según la tecnología del BESS. Reporte mensual obligatorio de Capacidad Instalada Neta (CIN) ajustada.

### 3.2 Recomendación regulatoria reportada

No se debe usar la potencia nominal de placa para acreditar potencia firme. La métrica defendible es la **potencia efectiva** considerando:
- Degradación SOH proyectada al año 5 o año 10 del horizonte de operación.
- Restricción de 4 horas de duración mínima.

**Ejemplo conceptual:** un sistema 100 MW / 200 MWh (2 horas de duración) acreditaría aproximadamente 50 MW de potencia firme bajo la regla de 4 horas, no 100 MW.

---

## 4. Marco institucional

| Entidad | Rol |
|---|---|
| **CNE** (Comisión Nacional de Energía) | Regulador único del sector energético desde mayo 2025. Sustituye a CRE y CNH. |
| **CENACE** (Centro Nacional de Control de Energía) | Coordinador técnico del SEN. Medición de DEF. Despacho. |
| **CFE** (Comisión Federal de Electricidad) | Contraparte contractual obligatoria para interconexión de SAEE. |
| **SENER** (Secretaría de Energía) | Marco estratégico de política energética nacional. Aprobación del PLADESE. |

---

## 5. Implicaciones para modelos financieros y dimensionamiento

1. **Potencia firme contratable ≠ potencia nominal del BESS.** Modelos que ingresen potencia firme a tasa de placa están sobrestimados.

2. **Curva SOH del datasheet del fabricante** es input obligatorio del modelo financiero. Para Hyperstrong LFP, ver `docs/catalogo_hyperstrong.md` (curva 21 años, año 0: 99.4% → año 20: 67.1%).

3. **Duración del BESS (kWh/kW) es crítica:** sistemas con duración menor a 4 horas tienen potencia firme acreditable reducida proporcionalmente bajo la regla CNE 2026.

4. **Ingresos por potencia firme** se calculan sobre potencia efectiva al año del horizonte que se elija (año 1 vs año 10).

---

## 6. Validaciones pendientes con cliente y terceros

| Validación | Responsable | Status |
|---|---|---|
| Confirmar criterio exacto CENACE aplica hoy para proyectos en construcción | Lalo / Soluciones MHG | Pendiente |
| Obtener texto completo DOF 16 abril 2026 | Lalo / consulta DOF directa | Pendiente |
| Validar contra contratos vigentes Soluciones MHG con CFE/CENACE | Soluciones MHG | Pendiente |
| Confirmar precios potencia firme contratable bajo régimen CNE 2026 | Soluciones MHG | Pendiente |

---

## 7. Fuentes consultadas

### 7.1 Fuentes primarias oficiales

- **DOF — Decreto de Ley de la Comisión Nacional de Energía** (18 marzo 2025).
- **gob.mx/cne** — sitio oficial de la Comisión Nacional de Energía. URL: https://www.gob.mx/cne
- **Cámara de Diputados — Texto íntegro Ley CNE**: https://www.diputados.gob.mx/LeyesBiblio/pdf/LCNE.pdf
- **Suprema Corte de Justicia de la Nación** — Sentencia Acción de Inconstitucionalidad 51/2025 (noviembre 2025).
- **DOF — Acuerdo CRE A/113/2024** (7 marzo 2025) — referencia histórica, abrogado.

### 7.2 Análisis legal de firmas internacionales

- **Greenberg Traurig LLP** — "Disposiciones Administrativas de Carácter General para la integración de Sistemas de Almacenamiento de Energía Eléctrica al Sistema Eléctrico Nacional" (mayo 2026). URL: https://www.gtlaw.com/en/insights/2026/5/disposiciones-sistemas-de-almacenamiento
- **DWF** — análisis de mecanismos de adquisición CENACE bajo nueva CNE (citado en Energía Estratégica, abril 2026).

### 7.3 Medios especializados sectoriales

- **Energía Estratégica** — cobertura de cambios CNE 2026. URLs:
  - https://www.energiaestrategica.com/mexico-cambia-las-reglas-del-bess-la-cne-redefine-la-bancabilidad-y-habilita-nuevos-servicios/
  - https://www.energiaestrategica.com/mexico-redefine-el-almacenamiento-con-nuevo-marco-entre-la-urgencia-por-confiabilidad-y-el-desafio-de-atraer-inversion/
  - https://www.energiaestrategica.com/mexico-despliega-tres-nuevas-regulaciones-y-marca-el-rumbo-del-almacenamiento-cuales-son-los-puntos-clave/
- **pv magazine México** — "Inicia operaciones la nueva Comisión Nacional de Energía de México" (mayo 2025). URL: https://www.pv-magazine-mexico.com/2025/05/23/inicia-operaciones-la-nueva-comision-nacional-de-energia-de-mexico/
- **Energy21** — "Los lineamientos y sesiones de la CNE" (julio 2025). URL: https://energy21.com.mx/los-lineamientos-y-sesiones-de-la-cne/
- **EMMI** — "La CNE entra en funciones" (mayo 2025). URL: https://emmi.mx/la-cne-entra-en-funciones-un-nuevo-capitulo-en-la-regulacion-energetica-de-mexico
- **Infobae** — "Comienza funciones nueva Comisión Nacional de Energía" (mayo 2025). URL: https://www.infobae.com/mexico/2025/05/22/comienza-funciones-nueva-comision-nacional-de-energia-regulara-cadenas-de-produccion-del-gas-natural/
- **CMIC** — "Publican Reglamento Interior de la Comisión Nacional de Energía" (mayo 2025). URL: https://www.cmic.org.mx/sectores/electrica/noticmic.cfm?seleccion=1630

### 7.4 Fuentes técnicas no verificadas contra texto DOF (uso con precaución)

- Blog **leadtransporteglobal.mx** — fórmula específica P_firme = (E_almacenable × η_descarga) / 4 horas. La fórmula es estándar internacional y consistente con prácticas de mercados similares (CAISO, PJM), pero la verificación contra el texto completo del DOF del 16 abril 2026 queda pendiente.
- Publicaciones en redes sociales del sector — contexto institucional general.

---

## 8. Aplicación en el modelo de la app

El motor de cálculo de la app `dimensionamiento-bess` implementa la determinación de potencia firme como **parámetro configurable**, con tres criterios disponibles:

| Criterio | Aplicación | Fórmula |
|---|---|---|
| **CNE 2026** (default) | Régimen vigente. Aplicable a proyectos nuevos bajo CFE post-17 abril 2026. | `P_firme = (E_almacenable × η_descarga) / 4 horas` |
| **CRE A/113/2024** (legacy) | Comparación con análisis hechos antes de abril 2026. **No aplicable a proyectos nuevos.** | `P_firme = percentil_80(descarga_hora_punta_anual)` |
| **Potencia nominal de placa** | Benchmark conservador no regulatorio. | `P_firme = P_nominal_kW` |

El usuario puede seleccionar el criterio en la configuración del proyecto. Cada criterio muestra su tooltip con la fuente regulatoria correspondiente.

**Parámetros adicionales del modelo:**
- Año del horizonte para aplicar SOH (default año 5).
- Eficiencia de descarga `η_descarga` (default √RTE).
- DoD máxima (default 95%).

---

## 9. Disclaimer

Este documento es referencia metodológica del modelo de la app. **No constituye asesoría legal, regulatoria ni financiera.** Las fuentes secundarias citadas en la sección 3 deben validarse contra el texto íntegro del DOF antes de utilizarse para contratación, inversión o decisiones regulatorias formales.

Para decisiones contractuales con CFE/CENACE, consultar directamente las disposiciones publicadas en el DOF y obtener asesoría legal especializada.
