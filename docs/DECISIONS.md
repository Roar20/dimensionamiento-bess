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

## 2026-05-17 — Módulo 2: Tab SFV con estructura narrativa secuencial

**Decisión:** El Tab SFV es scroll vertical con 5 secciones numeradas, cada una con párrafo introductorio dinámico + KPIs + gráfica. La granularidad temporal global controla todas las secciones simultáneamente.
**Razón:** Estructura narrativa contesta preguntas en orden ("¿Cuánto?", "¿Cuándo en el día?", "¿Cómo varía día a día?", "¿Cuándo en detalle?", "Resumen mensual"). Reduce carga cognitiva vs un dashboard con muchos paneles.
**Alternativa descartada:** Dashboard con KPIs paralelos. Funciona como cockpit pero no como herramienta de exploración.

## 2026-05-17 — Convención hora-ending en UI

**Decisión:** Toda la UI del Tab SFV expone horas en convención hora-ending 1..24 (idéntica al motor 1B y al lenguaje CFE GDMTH). La banda "Hora-punta CFE" muestra [18, 22] inclusive.
**Razón:** Paridad con motor + lenguaje regulatorio + consistencia entre tabs futuros.
**Alternativa descartada:** Mostrar 0..23. Habría forzado al usuario a traducir mentalmente.

## 2026-05-17 — Heatmap día×hora con SVG custom (no Recharts)

**Decisión:** El heatmap de la Sección 4 se construye con SVG nativo en React (no librería). Escala de color YlOrRd interpolada linealmente entre 5 paradas.
**Razón:** Recharts no tiene un heatmap nativo; soluciones de terceros (Nivo, Visx) duplican el bundle. SVG nativo da control total con < 80 LOC.
**Alternativa descartada:** Nivo Heatmap (~100 KB extra al bundle).

## 2026-05-17 — KPI renombrado "Potencia promedio anual del SFV"

**Decisión:** En la UI, el KPI que internamente se llama `pico_kw` (motor) se presenta como "Potencia promedio anual del SFV" + sublabel "% del POI".
**Razón:** El equipo comercial pidió un nombre menos técnico para el cliente final. El nombre interno se mantiene en el motor para validación cruzada con el Colab.
**Alternativa descartada:** Mantener "Pico" en UI. Era confuso para el comercial.

## 2026-05-17 — Persistencia del periodo activo

**Decisión:** `usePeriodoActivo` persiste `{ granularidad, indice }` en `localStorage` bajo `dimensionamiento-bess:periodo-activo`. Al cambiar planta (limpiar datos), también se limpia esta llave.
**Razón:** El usuario que regresa a la app no pierde su contexto temporal. Pero al cambiar de planta, no tiene sentido conservar un periodo que no aplica.

## 2026-05-17 — Auto-navegación tras procesar archivo

**Decisión:** Procesar archivo en `/` lleva automáticamente a `/sfv`. Si `localStorage` ya tiene datos al cargar la app en `/`, también redirige.
**Razón:** El usuario no necesita ver el resumen post-carga; la historia continúa naturalmente en el primer tab.
**Alternativa descartada:** Mostrar resumen intermedio. Era un paso muerto.

## 2026-05-17 — `useDatosSFV` movido a contexto

**Decisión:** El hook `useDatosSFV` ahora se consume vía `DatosSFVProvider` (Context API) en lugar de instancias independientes por componente.
**Razón:** Múltiples componentes (AppShell, Home, SFV) necesitan ver el mismo estado y reaccionar a `cargar`/`limpiar`. Sin contexto, cada hook tenía su propia copia del estado.
**Alternativa descartada:** Pasar `datos` por props desde un componente raíz. Funciona pero contamina la API.

## 2026-05-17 — Selector temporal con 5 granularidades

**Decisión:** Extender el selector temporal con `semestral` y `trimestral`. Queda fuera `semanal` por ahora (Módulo 2.2 si surge demanda real). El orden de izquierda a derecha en la UI es de menor resolución a mayor: Anual / Semestral / Trimestral / Mensual / Diario.
**Razón:** Reportes corporativos típicos del cliente pivotean por trimestre/semestre fiscal; sin estas granularidades el comercial tenía que agregar a mano.
**Alternativa descartada:** Incluir Semanal desde ya. Sin un caso de uso concreto, agrega complejidad al selector (sería el item con más opciones, ~52 por año) sin valor demostrado.

## 2026-05-17 — Tooltip de Recharts unificado con fondo navy

**Decisión:** Componente `TooltipRecharts` reutilizable con fondo `--color-header-bg` y texto blanco. Reemplaza el tooltip default de Recharts en las 3 gráficas del Tab SFV (perfil horario, serie diaria, histograma) y la curva del día (granularidad diaria).
**Razón:** El default mostraba texto del color de la serie sobre fondo blanco; con la paleta verde sobrio del producto el texto se perdía. Centralizar el componente garantiza coherencia visual cuando lleguen más tabs con gráficas.
**Alternativa descartada:** Solo modificar `contentStyle` de cada Tooltip. Cada gráfica seguiría teniendo su propio formato; el wrapper unificado es más mantenible.

## 2026-05-17 — Tooltip explicativo en `BloqueTecnico`

**Decisión:** `BloqueTecnico` ahora acepta prop opcional `tooltip` que renderiza un ícono `(i)` junto al título con explicación en hover. Aplicado a los 4 bloques técnicos del Tab SFV (HSE/FC, clipping, histograma, matriz heatmap).
**Razón:** El cliente final abre Vista técnica con curiosidad pero no entiende términos como "clipping" o "P10". El ícono `(i)` evita que el tecnólogo tenga que explicar verbalmente cada término.
**Alternativa descartada:** Glosario aparte. Más completo pero rompe el flujo de exploración.

## 2026-05-16 — Stack Vite + React 19 + TS strict

**Decisión:** Mismo stack que curvas-bess, subiendo a React 19 y forzando TS strict.
**Razón:** Reuse de ~1,800 LOC validados, sin necesidad de SSR.
**Alternativa descartada:** Next.js App Router (overhead injustificado para SPA con localStorage).
