import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COPY_M3 } from "@/lib/copy/modulo-3";

interface Props {
  url: string;
  nombreArchivo: string;
}

export function BotonDescargarDatasheet({ url, nombreArchivo }: Props) {
  const [disponible, setDisponible] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!cancelado) setDisponible(res.ok);
      })
      .catch(() => {
        if (!cancelado) setDisponible(false);
      });
    return () => {
      cancelado = true;
    };
  }, [url]);

  const copy = COPY_M3.seccion5;

  if (disponible === null) {
    return (
      <Button type="button" variant="outline" disabled>
        {copy.pdfVerificando}
      </Button>
    );
  }

  if (!disponible) {
    return (
      <Button type="button" variant="outline" disabled>
        {copy.pdfNoDisponible}
      </Button>
    );
  }

  return (
    <Button asChild variant="outline">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={nombreArchivo}
      >
        <Download className="mr-2 h-4 w-4" />
        {copy.descargarPdf}
      </a>
    </Button>
  );
}
