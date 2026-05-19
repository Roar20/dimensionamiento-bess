/**
 * Registro de curvas SOH (State of Health) por proveedor y garantía.
 * Consumidores leen vía catálogo (equipo.curvaSoh).
 */
export const CURVAS_SOH = {
  hyperstrong_lfp_standard: [
    0.9939, 0.9497, 0.9223, 0.8998, 0.8799, 0.8619, 0.8452,
    0.8295, 0.8146, 0.8004, 0.7868, 0.7736, 0.7610, 0.7487,
    0.7367, 0.7251, 0.7138, 0.7027, 0.6918, 0.6808, 0.6708,
  ],
} as const
