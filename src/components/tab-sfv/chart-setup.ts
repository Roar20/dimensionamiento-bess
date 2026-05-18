/**
 * Registro central de componentes de Chart.js para el Tab SFV.
 * Se importa una sola vez desde `TabSFV.tsx` para asegurar que los
 * subcomponentes Line/Bar tengan registradas las escalas y plugins.
 */
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

let registered = false;

export function ensureChartJsRegistered() {
  if (registered) return;
  ChartJS.register(
    BarController,
    BarElement,
    CategoryScale,
    Filler,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip
  );
  ChartJS.defaults.font.family =
    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.color = "#525252";
  registered = true;
}
