// Unreleased privileged workflows must fail before reading input or credentials.
export function previewResponse(req: Request): Response {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  return new Response(JSON.stringify({ success: false, code: 'FEATURE_PREVIEW',
    error: 'This workflow is not available yet.' }), { status: 503, headers });
}
