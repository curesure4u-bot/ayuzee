import { useEffect, useRef } from "react";
import { POSE_CONNECTIONS, type Landmark } from "@/lib/posture/poseAnalysis";

interface Props {
  imageUrl: string;
  landmarks?: Landmark[] | null;
  className?: string;
  accent?: string;
}

export const PostureSkeleton = ({ imageUrl, landmarks, className, accent = "#10b981" }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const draw = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      if (!landmarks?.length) return;
      // Connections
      ctx.strokeStyle = accent;
      ctx.lineWidth = Math.max(2, Math.round(w / 250));
      ctx.beginPath();
      for (const [a, b] of POSE_CONNECTIONS) {
        const A = landmarks[a], B = landmarks[b];
        if (!A || !B) continue;
        ctx.moveTo(A.x * w, A.y * h);
        ctx.lineTo(B.x * w, B.y * h);
      }
      ctx.stroke();
      // Points
      ctx.fillStyle = "#fbbf24";
      const r = Math.max(3, Math.round(w / 200));
      for (const p of landmarks) {
        if (!p) continue;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    if (img.complete) draw();
    else img.onload = draw;
  }, [imageUrl, landmarks, accent]);

  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <img ref={imgRef} src={imageUrl} alt="Posture capture" className="block w-full rounded-md" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
