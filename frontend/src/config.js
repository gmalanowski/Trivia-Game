// Centralna konfiguracja backendu dla frontendu
// Pobiera VITE_BACKEND_URL z .env, obsługuje wsteczną kompatybilność z /api/v1
// Jeśli zmienna nie istnieje, używa localhost:3000 jako fallback

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Usuń końcowe /api/v1 oraz trailing slash (wsteczna kompatybilność)
const backendOrigin = rawBackendUrl.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

// Helper do bezpiecznego łączenia ścieżek URL (zapobiega podwójnym slashom)
export const joinPath = (...segments) => {
  return segments
    .map((seg) => seg.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
};

export const API_BASE_URL = `${backendOrigin}/api/v1`;
export const STATIC_BASE_URL = `${backendOrigin}/static`;
