const DEFAULT_ORIGINS = [
  "https://ayuzee.com",
  "https://www.ayuzee.com",
  "https://ayuzee.lovable.app",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

const parseAllowedOrigins = () => {
  const raw = Deno.env.get("ALLOWED_ORIGINS");
  if (!raw) return DEFAULT_ORIGINS;
  return raw.split(",").map((origin) => origin.trim()).filter(Boolean);
};

export const getCorsHeaders = (
  req?: Request,
  extraAllowHeaders = "authorization, x-client-info, apikey, content-type, x-internal-secret, x-api-key",
): Record<string, string> => {
  const allowed = parseAllowedOrigins();
  const requestOrigin = req?.headers.get("Origin");
  const allowOrigin =
    requestOrigin && allowed.includes(requestOrigin)
      ? requestOrigin
      : allowed[0] ?? "https://ayuzee.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": extraAllowHeaders,
    Vary: "Origin",
  };
};

export const handleCorsPreflight = (req: Request, extraAllowHeaders?: string) => {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, { headers: getCorsHeaders(req, extraAllowHeaders) });
};
