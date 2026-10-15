export function previewResponse(feature) {
  return {
    statusCode: 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      success: false,
      ok: false,
      preview: true,
      code: "FEATURE_PREVIEW",
      feature,
      error: "This service is a preview and is not available yet. No action was performed.",
    }),
  };
}
