import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { COPY_M2 } from "@/lib/copy/modulo-2";

interface Props {
  abierto: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function ModalCambiarPlanta({
  abierto,
  onCancelar,
  onConfirmar,
}: Props) {
  return (
    <Dialog open={abierto} onOpenChange={(v) => (v ? null : onCancelar())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{COPY_M2.modalCambiar.titulo}</DialogTitle>
          <DialogDescription>
            {COPY_M2.modalCambiar.descripcion}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={onCancelar}>
            {COPY_M2.modalCambiar.cancelar}
          </Button>
          <Button type="button" onClick={onConfirmar}>
            {COPY_M2.modalCambiar.continuar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
