import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

export function MetodologiaFinanciero() {
  return (
    <MetodologiaDetalles titulo="Metodología y procedencia de las cifras">
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Datos reales del simulador:
        </strong>{" "}
        el perfil horario 8,760 registros viene del dataset cargado por el
        usuario en el onboarding (Tequila 2025 valida la implementación).
        El motor de dispatch BESS (despacho greedy/arbitraje) es el mismo
        que el Tab SFV+BESS y produce los KPIs energéticos del año 1
        (descargado total, descargado en hora-punta, ciclos).
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Curva SOH del catálogo (d44):
        </strong>{" "}
        21 valores anuales del año 0 al 20 declarados por Hyperstrong para
        la plataforma LFP-314Ah. El componente consume{" "}
        <code>equipo.curvaSoh</code> a través del catálogo; no importa el
        registro <code>CURVAS_SOH</code> directamente. La visualización
        canónica de la curva vive en Tab BESS (d45); aquí solo se aplica
        sobre los componentes BESS del ingreso anual.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Modelo de proyección 20 años:
        </strong>{" "}
        <code>ingreso_total[i] = ingreso_PPA_generacion + ingreso_captura_excedentes × ratio_SOH + ingreso_arbitraje × ratio_SOH + ingreso_pfirme × ratio_SOH + ingreso_cels</code>,
        donde <code>ratio_SOH = curva[i] / curva[1]</code>. Los CELs no
        degradan con SOH BESS porque dependen de la generación del SFV.
        La generación del SFV se considera constante año a año en el
        modelo simplificado.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Captura de excedentes (proxy):
        </strong>{" "}
        para cada hora del perfil ajustado por factor de producción, se
        suma <code>max(0, gen_kw − POI_kw)</code> limitado por la
        capacidad de carga horaria del BESS y aplicando pérdidas RTE
        simétricas (√RTE en carga × √RTE en descarga). Es proxy: asume
        que sin BESS toda esa energía se hubiera perdido por curtailment
        al POI.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Potencia firme proxy (pendiente PAA):
        </strong>{" "}
        percentil 80 de la potencia entregada por el BESS en kW durante
        la ventana hora-punta CFE 18-22h a lo largo del año. La fórmula
        regulatoria definitiva (PAA del Manual de Mercado para el
        Balance de Potencia, DACG DOF 3-abr-2026) está pendiente de
        validar con Lalo y requiere inputs CENACE (100 horas críticas,
        FIF). Este proxy no representa reconocimiento oficial.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Arbitraje (uplift):
        </strong>{" "}
        <code>descargado_en_punta_MWh × LMP × diferencial_pct</code>.
        Cuantifica el valor adicional de concentrar la descarga en la
        ventana CFE 18-22h vs hora-valle. Default <code>diferencial_pct = 30%</code>{" "}
        del LMP (aproximación del spread punta-valle en GDMTH).
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          CAPEX y OPEX (proxy):
        </strong>{" "}
        CAPEX por defecto se calcula como{" "}
        <code>precio_usd_unidad × n_unidades × tipo_cambio</code> con
        precios del catálogo Hyperstrong; el panel permite override en
        MXN. OPEX por defecto es 2% anual sobre CAPEX (proxy industria);
        editable. La confirmación de ambos con MHG y Hyperstrong está
        pendiente.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Payback consistente con flujo acumulado:
        </strong>{" "}
        el payback se calcula por interpolación lineal sobre la lista de
        flujos acumulados (encuentra el año fraccionario donde cruza
        cero). El gráfico de flujo acumulado destaca el punto del año
        más cercano al cruce. Ambos derivan del mismo array de 21
        flujos, por lo que el KPI y la curva son consistentes por
        construcción.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Sensibilidad operativa (factor de producción):
        </strong>{" "}
        slider 100-200% que pre-multiplica el perfil horario del SFV
        antes del dispatch. Modela condiciones operativas óptimas (margen
        de tracker, configuración ideal de strings). NO modela
        ampliación de capacidad CFE ni overbuild masivo (cumple d18 del
        proyecto). Con factor &gt; 1, la generación puede exceder POI y
        el BESS captura los excedentes resultantes.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Limitaciones explícitas:
        </strong>{" "}
        (a) el SFV no degrada en este modelo simplificado (típico fade
        0.5%/año podría incorporarse en versión rigurosa); (b) el LMP es
        un valor anual sin estacionalidad ni perfil horario; (c) los
        CELs se aplican a toda la generación SFV sin distinguir
        elegibilidad regulatoria por año de comisionamiento; (d) no se
        modela inflación de precios PPA ni de OPEX.
      </p>
      <p>
        <strong className="font-medium text-[var(--color-text-primary)]">
          Pendientes de validación:
        </strong>{" "}
        confirmar con MHG los precios PPA para Tequila (actualmente proxy
        Estanzuela 2 marzo 2026), cerrar la fórmula PAA con Lalo,
        confirmar CAPEX/OPEX con Hyperstrong y CFO MHG, decidir si se
        incorporan inflación y estacionalidad LMP en el siguiente
        iteración.
      </p>
    </MetodologiaDetalles>
  );
}
