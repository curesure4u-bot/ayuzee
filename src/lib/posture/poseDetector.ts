// MediaPipe Pose loader (browser-only) using ESM CDN.
// Returns a function that detects landmarks from an HTMLImageElement / HTMLVideoElement.

import type { Landmark } from "./poseAnalysis";

let landmarker: any = null;
let loading: Promise<any> | null = null;

const TASKS_VERSION = "0.10.14";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const loadPoseLandmarker = async () => {
  if (landmarker) return landmarker;
  if (loading) return loading;
  loading = (async () => {
    const vision: any = await import(
      /* @vite-ignore */ `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/vision_bundle.mjs`
    );
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
    landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: "IMAGE",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return landmarker;
  })();
  return loading;
};

export const detectFromImage = async (img: HTMLImageElement): Promise<Landmark[] | null> => {
  const lm = await loadPoseLandmarker();
  const result = lm.detect(img);
  if (!result?.landmarks?.length) return null;
  return result.landmarks[0] as Landmark[];
};
