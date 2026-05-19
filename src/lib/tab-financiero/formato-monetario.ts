/**
 * Política de formato monetario del Tab Análisis Financiero.
 *
 * NO se usa `Intl.NumberFormat` con notation "compact" porque devuelve
 * strings tipo "350 mil" o "2.24 M" según el navegador y la locale —
 * no es determinístico cross-browser. Este helper expone tres funciones
 * con reglas explícitas y deterministas:
 *
 *   - formatoCompacto(v) → "$XXXk" o "$X.XXM" con símbolo monetario.
 *   - formatoCompleto(v) → "$X,XXX,XXX" con separador de miles y $.
 *   - formatoEje(v)      → "XXXk" o "X.XXM" SIN símbolo monetario.
 *
 * Convenciones:
 *  - Signo negativo: U+2212 ("−"), NO guion ASCII.
 *  - Separador decimal: punto.
 *  - Sin palabras "mil", "millones", "miles".
 *  - Símbolo monetario "$" solo en formatoCompacto y formatoCompleto.
 *  - Promoción k→M sobre el valor YA REDONDEADO para evitar salidas
 *    tipo "$1000k" cuando el crudo está justo bajo 1M y redondea a 1M.
 */

const SIGNO_NEG = "−"; // − minus sign

function partes(valor: number): { signo: string; abs: number } {
  if (Number.isNaN(valor) || !Number.isFinite(valor) || valor === 0) {
    return { signo: "", abs: 0 };
  }
  if (valor < 0) return { signo: SIGNO_NEG, abs: -valor };
  return { signo: "", abs: valor };
}

/**
 * Decide qué representación usar (k, M, o cero) basado en el valor
 * REDONDEADO, no en el crudo. Devuelve un objeto que ambos
 * `formatoCompacto` y `formatoEje` consumen para construir el string
 * final con o sin símbolo monetario.
 */
function piezasCompactas(valor: number): {
  signo: string;
  texto: string;
} {
  const { signo, abs } = partes(valor);
  if (abs === 0) return { signo: "", texto: "0" };

  const representacion_k = Math.round(abs / 1_000);
  const representacion_m_raw = abs / 1_000_000;
  const representacion_m = Math.round(representacion_m_raw * 100) / 100;

  // Promoción crítica: si k>=1000 (es decir el valor redondeado en k
  // alcanza el millón), usar M con 2 decimales. Esto evita "$1000k".
  if (representacion_k >= 1000) {
    return { signo, texto: `${representacion_m.toFixed(2)}M` };
  }
  // Si el valor es claramente < 1M (en k), usar k.
  return { signo, texto: `${representacion_k}k` };
}

export function formatoCompacto(valor: number): string {
  if (!Number.isFinite(valor) || Number.isNaN(valor)) return "$0";
  if (valor === 0) return "$0";
  const { signo, texto } = piezasCompactas(valor);
  return `${signo}$${texto}`;
}

export function formatoEje(valor: number): string {
  if (!Number.isFinite(valor) || Number.isNaN(valor)) return "0";
  if (valor === 0) return "0";
  const { signo, texto } = piezasCompactas(valor);
  return `${signo}${texto}`;
}

export function formatoCompleto(valor: number): string {
  if (!Number.isFinite(valor) || Number.isNaN(valor)) return "$0";
  if (valor === 0) return "$0";
  const { signo, abs } = partes(valor);
  // Si tiene parte decimal significativa, mostrarla con 2 dígitos.
  const tieneDecimales = Math.abs(abs - Math.round(abs)) > 1e-9;
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: tieneDecimales ? 2 : 0,
    maximumFractionDigits: tieneDecimales ? 2 : 0,
  });
  return `${signo}$${formatter.format(abs)}`;
}
