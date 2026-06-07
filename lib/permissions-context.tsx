"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Mapeo de código de permiso → rutas del workspace que protege.
 * Si un rol pierde ese permiso, esas rutas quedan bloqueadas.
 */
export const PERMISSION_ROUTES: Record<string, string[]> = {
  ver_flota:            ["/terminal/flota", "/terminal/energia", "/cof/terminales"],
  editar_asignacion:    ["/terminal/despacho"],
  gestionar_usuarios:   ["/admin/usuarios"],
  modificar_parametros: ["/admin/parametros", "/cof/kpis", "/cof/reportes"],
  ver_auditoria:        ["/admin/auditoria"],
};

/**
 * Dado un pathname y una lista de permisos del usuario,
 * retorna true si el usuario PUEDE acceder a esa ruta.
 * Rutas no registradas en PERMISSION_ROUTES siempre son permitidas.
 */
export function isRouteAllowed(pathname: string, grantedPerms: string[]): boolean {
  for (const [perm, routes] of Object.entries(PERMISSION_ROUTES)) {
    if (routes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return grantedPerms.includes(perm);
    }
  }
  return true; // ruta no protegida por permisos → siempre permitida
}

interface PermissionsContextType {
  grantedPerms: string[];      // lista de códigos de permiso del rol del usuario
  permissionsLoaded: boolean;
  setGrantedPerms: (perms: string[]) => void;
}

const PermissionsContext = createContext<PermissionsContextType>({
  grantedPerms: [],
  permissionsLoaded: false,
  setGrantedPerms: () => {},
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [grantedPerms, setGrantedPerms] = useState<string[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  const handleSet = (perms: string[]) => {
    setGrantedPerms(perms);
    setPermissionsLoaded(true);
  };

  return (
    <PermissionsContext.Provider value={{ grantedPerms, permissionsLoaded, setGrantedPerms: handleSet }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
