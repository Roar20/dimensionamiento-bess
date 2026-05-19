export function DisclaimerTransversal() {
  return (
    <div className="mb-6 space-y-2">
      <div className="rounded-[12px] border-[0.5px] border-[#F59E0B] bg-[#FEF3C7] px-4 py-3 text-[12px] leading-relaxed text-[#78350F]">
        <strong className="font-medium">
          Modelo preliminar para discusión metodológica.
        </strong>{" "}
        Precios PPA validados con liquidación CFE marzo 2026 Estanzuela 2
        (proxy para Tequila pendiente confirmar con MHG). CAPEX, OPEX y WACC
        son estimaciones pendientes de validación con MHG, Hyperstrong y CFO
        MHG respectivamente. No representa valuación financiera bancable ni
        cálculo regulatorio oficial.
      </div>
      <div className="rounded-[12px] border-[0.5px] border-[#FCA5A5] bg-[#FEF2F2] px-4 py-2.5 text-[12px] leading-relaxed text-[#7F1D1D]">
        <strong className="font-medium uppercase tracking-wide text-[11px]">
          Potencia firme proxy conservador preliminar:
        </strong>{" "}
        el aporte BESS depende fuertemente de este componente. La fórmula
        regulatoria definitiva (PAA del Manual de Mercado para el Balance de
        Potencia, DACG DOF 3-abr-2026) está pendiente de validar con Lalo;
        requiere inputs CENACE (100 horas críticas, FIF) que aún no están
        confirmados. Default factor credibilidad 40% — editable desde el
        panel.
      </div>
    </div>
  );
}
