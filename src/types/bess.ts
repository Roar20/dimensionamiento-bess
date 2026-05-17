/**
 * Categoría de energía almacenable del SFV.
 *
 * NO son escenarios optimista/probable/conservador. Son descomposiciones
 * complementarias de la misma energía del SFV según qué supuestos del PPA
 * aplican.
 */
export type CategoriaEnergia =
  | {
      tipo: "toda_energia";
      etiqueta: string;
      descripcion: string;
    }
  | {
      tipo: "fuera_hora_punta_cfe";
      ventana_punta: readonly [number, number];
      etiqueta: string;
      descripcion: string;
    }
  | {
      tipo: "compromiso_ppa_mensual_mwh";
      mwh_mes: number;
      etiqueta: string;
      descripcion: string;
    }
  | {
      tipo: "exceso_capacidad_cfe_kw";
      techo_kw: number;
      etiqueta: string;
      descripcion: string;
    };

export type CategoriaTipo = CategoriaEnergia["tipo"];

export type SeleccionCategoria = "ninguna" | CategoriaTipo;

/** Parámetros configurables que el usuario captura en Sección 2A. */
export type ParametrosPPA = {
  compromiso_mensual_mwh: number;
  ventana_punta_cfe: readonly [number, number];
  /** Heredado del onboarding; no editable en Tab BESS. */
  capacidad_poi_kw: number;
};

export type ResumenCategoria = {
  categoria: CategoriaEnergia;
  total_mwh: number;
  porcentaje: number;
  promedio_mensual_mwh: number;
};
