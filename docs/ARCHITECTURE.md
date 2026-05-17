# Arquitectura de `dimensionamiento-bess`

## Principios

1. **Motor puro en `src/lib/core/`**: funciones que reciben datos y devuelven resultados. Cero dependencias de UI, cero React, cero localStorage. Testeable con Vitest sin DOM.
2. **UI consume el motor**: los componentes de `src/components/domain/` llaman funciones de `core/` y renderizan. No hacen cálculos.
3. **Estado por planta vive en Context** (no en localStorage directamente; el context persiste).
4. **Una planta a la vez**: la app maneja una planta activa; portar configuración se hace exportando/importando JSON (Módulo 9).
5. **Sin acoplamiento a overbuild ni a ampliación del SFV**: el dominio Wave 1 asume SFV existente con capacidad CFE fija. Wave 2 (ampliación) será un repo distinto o una versión futura.

## Capas

```
[ UI (src/components/domain/) ]
        ↓ consume
[ Hooks de coordinación (src/hooks/) ]
        ↓ llaman
[ Motor puro (src/lib/core/) ]
        ↓ recibe
[ Datos de planta (cincominutales, parámetros) ]
```

## Convenciones de naming

- Componentes: PascalCase, prefijo `Tab*` para tabs principales.
- Funciones de motor: camelCase, verbos en inglés (`calculateSurplus`, `simulateDispatch`).
- Variables de dominio en español cuando son nombres del usuario (`excedentesDiarios`, `potenciaFirme`).
- Constantes: UPPER_SNAKE.
- Sufijo de unidad en variables numéricas (`mxn_anual`, `kw_firme`, `kwh_total`).
- Imports: alias `@/` siempre, nunca relativos profundos.
