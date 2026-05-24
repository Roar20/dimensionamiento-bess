# Guion Ejecutivo — Entrega 1 (v2, ajustado al recon)

**Doble propósito:** (1) narrativa del PowerPoint para la junta; (2) blueprint del futuro tab "Resumen Ejecutivo" (D-PROYECTO-08, diferido post-deck).

**Cambios respecto a v1 (por el recon global):**
- Tequila se narra por **excedentes emergentes (+20%)**, no por arbitraje (D-DECK-01). Pantallazos salen del **Tab Financiero / SeccionGeneracionFactor**, NO del pantallazo de 95.6 MWh.
- Estanzuela se narra como **operación libre vs restringida a punta** (D-DECK-02), NO "escalonado vs parejo" (ese vocabulario no describe el motor real).
- Cada recomendación lleva su **supuesto encapsulado**: afirma lo defendible bajo el contexto actual, no una verdad absoluta.

**Filosofía rectora:** lectura, no modelado. El camino del dato a la conclusión es observable; solo la recomendación final es criterio declarado. Sin jerga ("arbitraje", "proxy", "LMP", "greedy"). Nomenclatura CENACE (PML, Zona Nodal). Tuteo profesional.

**Cómo leer este documento:** cada bloque tiene dos capas.
- **[OBSERVACIÓN]** = anclada a lo que la gráfica muestra. El lector lo ve por sí mismo.
- **[CRITERIO]** = juicio del consultor. Declarado como tal, no disfrazado de observación.
La versión para slide (narración limpia) va al final de cada historia, sin etiquetas.

---

## HISTORIA 1 — TEQUILA 1

### Hero (slide)
> **El sistema solar de Tequila opera hoy dentro de su capacidad de inyección. El valor de un sistema de almacenamiento aparece bajo un escenario de aumento de generación cercano al 20% —equivalente, por ejemplo, a la instalación de un tracker— cuando los picos cruzan el punto de interconexión.**

### Bloque 1 — Qué está pasando hoy
**Pregunta ejecutiva: ¿el sistema actual ya está limitado?**

- **[OBSERVACIÓN]** La curva de generación promedio se mantiene por debajo del punto de interconexión (500 kW). El pico no alcanza ese límite. *(Visual: SeccionGeneracionFactor, factor 1.0 — sin zona verde de captura.)*
- **[OBSERVACIÓN]** Generación anual ~913 MWh.
- **[CRITERIO]** Hoy no hay energía excedente sobre el punto de interconexión que un almacenamiento pueda capturar. El sistema no topa su capacidad de inyección.

### Bloque 2 — Qué cambia con mayor generación (+20%)
**Pregunta ejecutiva: ¿qué desbloquea el tracker?**

- **[OBSERVACIÓN]** Al elevar la generación ~20%, la curva cruza el punto de interconexión y emerge una zona de energía capturable en las horas centrales. *(Visual: SeccionGeneracionFactor, factor 1.20 — zona verde "capturable" aparece sobre los 500 kW.)*
- **[CRITERIO]** El aumento de generación no solo produce más energía; crea las condiciones físicas para que un almacenamiento tenga energía que capturar.
- **Supuesto encapsulado:** el +20% modela el efecto de un tracker sobre el perfil horario (multiplicativo). Tequila no tiene tracker ni terreno adicional hoy; esto ilustra el escenario, no una instalación existente.

### Bloque 3 — Recomendación
**Pregunta ejecutiva: ¿vale la pena el almacenamiento?**

> **[CRITERIO] Recomendación preliminar: una batería de 300 kW × 4 horas es un punto de partida razonable, condicionado a que se incorpore mayor generación (tracker) y a validar el comportamiento de precios PML en la zona.**

- **[OBSERVACIÓN] Qué limita hoy el valor:**
  1. Sin el aumento de generación, no hay excedente sobre el punto de interconexión que capturar.
  2. La configuración final requiere el histórico de precios PML, aún pendiente de validación con CENACE.
- **[CRITERIO]** 300 kW × 4h es punto de partida, no solución final. La configuración final se afina con el histórico de PML.

### Nota de honestidad (pie)
*Tequila ilustra un caso de valor condicional. Presentarlo así —en lugar de forzar un retorno— es lo que hace defendible la metodología.*

### — Versión narración limpia (slide, sin etiquetas) —
> Tequila opera hoy dentro de su capacidad: la curva no cruza el punto de interconexión, así que no hay excedente que almacenar. Bajo un escenario de aumento de generación cercano al 20% —equivalente, por ejemplo, a un tracker— los picos cruzan ese límite y aparece energía capturable. En ese escenario, una batería de 300 kW × 4 horas es un punto de partida razonable; la configuración final se afina con el histórico de precios PML de la zona.

---

## HISTORIA 2 — ESTANZUELA 2

### Hero (slide)
> **Estanzuela reúne las condiciones para capturar valor con almacenamiento: tiene tracker, terreno adicional y un mes de datos de precios reales. Sobre esa base, una batería de 450 kW × 4 horas sirve como dimensionamiento de referencia.**

### Bloque 1 — Qué está pasando hoy
**Pregunta ejecutiva: ¿cuál es la base de Estanzuela?**

- **[OBSERVACIÓN]** Sistema con tracker y terreno adicional. Se cuenta con un mes de datos con precios reales (Tequila solo tiene generación).
- **[CRITERIO]** Aquí no se supone el potencial; se observa con datos.
- **Supuesto encapsulado:** los KPIs se derivan de un mes de datos. Las cifras anualizadas son extrapolación de ese periodo, no de un año completo medido.

### Bloque 2 — Qué cambia con almacenamiento
**Pregunta ejecutiva: ¿qué estrategia de operación rinde más?**

- **[OBSERVACIÓN]** Comparación de dos formas de operar la batería, ambas reales en el motor:
  - **Operación libre:** la batería descarga en cuanto tiene energía, a cualquier hora.
  - **Operación restringida a punta:** la batería concentra su descarga en la ventana de mayor valor tarifario (18–22h).
  *(Visual: SeccionComparativaEstrategias — ambas corridas lado a lado, con captura, ciclos y fracción capturada.)*
- **[OBSERVACIÓN]** Cards de lectura: captura anual · utilización (ciclos) · payback.
- **[CRITERIO]** La diferencia entre ambas operaciones es el argumento de por qué importa *cuándo* descarga la batería, no solo cuánto.
- **Supuesto encapsulado:** la equivalencia exacta entre estas operaciones y la metodología de las gráficas de referencia de Lalo está **pendiente de validación con Lalo**. No se afirma réplica exacta.

### Bloque 3 — Recomendación
**Pregunta ejecutiva: ¿qué recomendar al cliente?**

> **[CRITERIO] Recomendación preliminar: 450 kW × 4 horas, con la operación restringida que concentra la descarga dentro de la ventana tarifaria de mayor valor (18–22h) como la de mayor aprovechamiento.**

- **[OBSERVACIÓN]** La diferencia económica entre las dos operaciones sostiene la recomendación.
- **[CRITERIO]** Con un mes de datos la recomendación tiene sustento; el histórico completo la fortalece.

### Nota de honestidad (pie)
*Estanzuela se apoya en un mes de datos reales: suficiente para una recomendación con sustento, fortalecible con más historia. La diferencia con Tequila no es de metodología, sino de disponibilidad y profundidad de información.*

### — Versión narración limpia (slide, sin etiquetas) —
> Estanzuela ya tiene lo que a Tequila le falta: tracker, terreno y un mes de precios reales. Comparamos dos formas de operar la batería —descarga libre vs descarga concentrada en la ventana tarifaria de mayor valor (18–22h)— y la segunda aprovecha mejor esa ventana. Sobre esa base, 450 kW × 4 horas es el dimensionamiento de referencia; el histórico completo de precios afinará el número.

---

## CIERRE DEL DECK (la diapositiva que te protege)

> **Estos son los dos casos acordados, presentados como pantallazos del análisis. Si en la junta surgen escenarios adicionales, se requiere una semana para completar el software, con el que se podrá preparar cualquier escenario solicitado.**

---

## ANEXO — Notas de producción del deck (no son slides)

**De dónde sale cada pantallazo (confirmado por el recon):**
- Tequila Bloque 1 y 2 → Tab Financiero, `SeccionGeneracionFactor`, factor 1.0 y 1.20. NO el pantallazo de 95.6 MWh del Tab SFV+BESS.
- Estanzuela Bloque 2 → Tab SFV+BESS, `SeccionComparativaEstrategias` (las dos corridas ya se generan en paralelo).

**Acciones externas que condicionan el deck:**
- **Lalo:** confirmar qué metodología usó en sus gráficas de referencia (450 kW × 4h). Desbloquea la afirmación de réplica en Estanzuela (D-DECK-02).
- **Paulina:** confirmar la frontera PPA de Estanzuela (D-FIN-04). Si el PPA deja libre la energía MTR-MDA, la historia de arbitraje de Tequila se reabre como opción (D-DECK-01).

**Lo que este deck NO toca (huecos del recon, fuera de alcance):**
El tab Resumen Ejecutivo —que centralizaría todo esto— tiene siete huecos identificados (precio PPA real sin cablear, veredicto sintético inexistente, anualización de datos parciales sin marca, modo de despacho uniforme inexistente, sin estado de madurez formal, sin catálogo de plantas). Ninguno bloquea el deck, porque los pantallazos salen de componentes que ya existen. Esos huecos son trabajo post-deck.

**Por qué este guion sigue siendo el blueprint del tab:**
Las dos historias comparten estructura idéntica (hero → 3 bloques → recomendación), parametrizable por planta. El deck es el ensayo barato: al narrarlo se valida qué framing resuena antes de codificar el tab. La capa [OBSERVACIÓN]/[CRITERIO] es la especificación de qué afirmación debe ir pegada a qué gráfica cuando se construya.
