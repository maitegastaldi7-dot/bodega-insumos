import { useCallback, useState } from "react";

const STORAGE_KEY = "bodega:usuarioActual";

export function useUsuarioActual() {
  const [usuario, setUsuarioState] = useState<string>(() => localStorage.getItem(STORAGE_KEY) || "Operario");

  const setUsuario = useCallback((nombre: string) => {
    const valor = nombre.trim() || "Operario";
    localStorage.setItem(STORAGE_KEY, valor);
    setUsuarioState(valor);
  }, []);

  return { usuario, setUsuario };
}
