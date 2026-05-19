import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

export function MetodologiaFinanciero() {
  return (
    <MetodologiaDetalles titulo="Metodología y procedencia de las cifras">
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Pregunta que responde el Tab:
        </strong>{" "}
        ¿cuál es el valor incremental de agregar BESS a un SFV existente?
        El payback BESS, los KPIs incrementales y el flujo acumulado se
        calculan exclusivamente contra el aporte del BESS sobre lo que la
        planta ya recibe sin él. Los ingresos del SFV (PPA + CELs) se
        muestran como contexto narrativo pero no entran al cálculo del
        retorno del CAPEX BESS.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Datos reales del simulador:
        </strong>{" "}
        el perfil horario 8,760 registros viene del dataset cargado por el
        usuario en el onboarding (Tequila 2025 valida la implementación).
        El motor de dispatch BESS (despacho greedy/arbitraje) es el mismo
        que el Tab SFV+BESS y produce los KPIs energéticos del año 1.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Generación entregable al POI:
        </strong>{" "}
        para cada hora, <code>min(potencia_kw_h, POI_kw)</code>. Acota la
        energía monetizable al PPA y a CELs a la capacidad CFE del cliente
        (Wave 1: capacidad fija, sin ampliación regulatoria). Con factor de
        producción 1.0 y pico SFV &lt; POI, equivale al total generado. Con
        factor &gt; 1, descuenta el excedente que sin BESS se perdería.
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
        sobre los tres componentes incrementales BESS.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Componentes del aporte incremental BESS:
        </strong>
        <br />
        (a){" "}
        <strong className="font-medium text-[var(--color-text-primary)]">
          captura de excedentes
        </strong>{" "}
        = <code>Σ_h min(max(0, gen_kw − POI), p_kw_BESS) × RTE / 1000</code>{" "}
        valorada al PPA. Para factor 1.0 con Tequila es 0; emerge con factor &gt; 1.
        <br />
        (b){" "}
        <strong className="font-medium text-[var(--color-text-primary)]">
          arbitraje hora-punta
        </strong>{" "}
        = <code>descargado_en_punta_MWh × LMP × diferencial_pct</code>.
        Cuantifica el valor incremental de concentrar la descarga en la
        ventana CFE 18-22h vs hora-valle. Default <code>30%</code> del LMP.
        <br />
        (c){" "}
        <strong className="font-medium text-[var(--color-text-primary)]">
          potencia firme proxy
        </strong>{" "}
        = mediana de descargas activas en hora-punta ×{" "}
        <code>factor_credibilidad</code> × <code>$/MW-mes × 12</code>.
        Default <code>credibilidad = 0.40</code>{" "}
        (conservador, pendiente confirmar con Lalo). La función filtra
        horas sin descarga antes de la mediana para reflejar la potencia
        típica entregada cuando el BESS opera; el factor de credibilidad
        descuenta para acercarse a lo que la PAA real reconocería.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Proyección 20 años:
        </strong>{" "}
        <code>ingreso_incremental_BESS[i] = (captura + arbitraje + pfirme) × ratio_SOH(i)</code>{" "}
        con <code>ratio_SOH = curva[i] / curva[1]</code>.{" "}
        <code>flujo_neto[0] = −CAPEX_BESS</code>;{" "}
        <code>flujo_neto[i≥1] = ingreso_incremental_BESS[i] − OPEX</code>.
        El flujo acumulado parte de <code>−CAPEX_BESS</code> y sube con cada
        año. <strong className="font-medium">
          El PPA SFV y los CELs SFV son constantes año a año y NO entran al
          flujo neto BESS;
        </strong>{" "}
        viven como contexto narrativo.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Payback consistente con flujo acumulado:
        </strong>{" "}
        el payback BESS se calcula por interpolación lineal sobre la lista
        de flujos acumulados (encuentra el año fraccionario donde cruza
        cero). El gráfico de flujo acumulado destaca el punto del año más
        cercano al cruce. Ambos derivan del mismo array de 21 flujos, por
        lo que el KPI y la curva son consistentes por construcción.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          CAPEX y OPEX (proxy):
        </strong>{" "}
        CAPEX por defecto se calcula como{" "}
        <code>precio_usd_unidad × n_unidades × tipo_cambio</code> con
        precios del catálogo Hyperstrong; el panel permite override en MXN.
        OPEX por defecto es 2% anual sobre CAPEX (proxy industria);
        editable. La confirmación de ambos con MHG y Hyperstrong está
        pendiente.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Sensibilidad operativa (factor de producción):
        </strong>{" "}
        slider 100-200% que pre-multiplica el perfil horario del SFV antes
        del dispatch. Modela condiciones operativas óptimas (tracker,
        strings limpios). <strong className="font-medium">
          NO modela ampliación de capacidad CFE ni overbuild masivo del SFV
        </strong>{" "}
        (cumple Wave 1 / d18). Con factor &gt; 1, la generación puede
        exceder POI y el BESS captura los excedentes resultantes; lo que
        no captura se pierde por curtailment al POI (visible en la sección
        "Generación bajo factor X% vs capacidad POI").
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Limitaciones explícitas:
        </strong>{" "}
        (a) el SFV no degrada en este modelo simplificado (típico fade
        0.5%/año podría incorporarse en versión rigurosa); (b) el LMP es
        un valor anual sin estacionalidad ni perfil horario; (c) los
        CELs se aplican a toda la generación entregable al POI sin
        distinguir elegibilidad regulatoria por año de comisionamiento;
        (d) no se modela inflación de precios PPA ni de OPEX; (e) la
        potencia firme proxy no sustituye la fórmula PAA regulatoria.
      </p>
      <p>
        <strong className="font-medium text-[var(--color-text-primary)]">
          Pendientes de validación:
        </strong>{" "}
        confirmar con MHG los precios PPA para Tequila (actualmente proxy
        Estanzuela 2 marzo 2026), cerrar la fórmula PAA con Lalo y subir
        el factor de credibilidad si el reconocimiento real lo permite,
        confirmar CAPEX/OPEX con Hyperstrong y CFO MHG, decidir si se
        incorporan inflación, fade del SFV y estacionalidad LMP en
        siguientes iteraciones.
      </p>
    </MetodologiaDetalles>
  );
}
