import { Switch } from "@/components/ui/switch";
import { useViewMode } from "@/context/ViewModeContext";

export function ViewToggle() {
  const { mode, setMode } = useViewMode();
  const isTecnico = mode === "tecnico";

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Switch
        checked={isTecnico}
        onCheckedChange={(checked) => setMode(checked ? "tecnico" : "cliente")}
        aria-label="Activar vista técnica"
      />
      <span className="select-none text-foreground">Vista técnica</span>
    </label>
  );
}
