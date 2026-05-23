/**
 * Loader del contrato JSON. Aislado, no consumido por runtime.
 *
 * Recibe el JSON ya parseado (caller-provided: fetch/fs/etc), valida contra
 * el esquema usando `validarX` del validador estructural, y devuelve el dato
 * tipado dentro de `ResultadoValidacion<T>`.
 *
 * Diseño deliberado: separar parsing (responsabilidad del caller) de
 * validación (responsabilidad de este módulo). Eso evita que el loader
 * dependa de fs (testing) o fetch (browser) — funciona en ambos contextos.
 * En PR-Arq-2b o posterior, el caller decide cómo trae el JSON al loader.
 */

import type {
  ArchivoPlanta,
  Manifest,
  ResultadoValidacion,
} from "@/types/contrato";
import { validarArchivoPlanta, validarManifest } from "./validar";

/**
 * Carga un archivo de planta a partir de su JSON ya parseado.
 *
 * - Valida contra el contrato (`validarArchivoPlanta`).
 * - Devuelve `{ ok: true; data }` o `{ ok: false; errores }` según el
 *   resultado de la validación.
 * - NO hace fetch, NO toca disco, NO tira excepción si el JSON está mal:
 *   el caller decide cómo manejar `ok: false`.
 */
export function cargarArchivoPlanta(
  json: unknown
): ResultadoValidacion<ArchivoPlanta> {
  return validarArchivoPlanta(json);
}

/**
 * Carga el manifest global a partir del JSON ya parseado.
 * Mismo diseño que `cargarArchivoPlanta`.
 */
export function cargarManifest(json: unknown): ResultadoValidacion<Manifest> {
  return validarManifest(json);
}
