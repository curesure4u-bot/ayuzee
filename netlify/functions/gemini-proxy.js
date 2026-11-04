import { previewResponse } from "../lib/preview-response.js";

// Re-enable only after authorization and sandbox checks pass.
export const handler = async () => previewResponse("gemini-proxy");
