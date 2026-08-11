/**
 * CelebrationModal — Confetti + SAG (Self Appreciation Gift) celebration
 * Shown when a bucket list item or vision board item is completed.
 */

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Gift, PartyPopper, Sparkles, Star, Trophy } from "lucide-react";

interface CelebrationModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sagPlanned?: string;
  onSave: (celebrationNote: string, sagClaimed: boolean) => void;
  xpEarned?: number;
}

// Simple canvas confetti effect
function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext("2d")!;
    const colors = ["#f43f5e", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#6366f1", "#14b8a6"];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      shape: "square" | "circle" | "star";
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape: (["square", "circle", "star"] as const)[Math.floor(Math.random() * 3)],
      });
    }

    let animId: number;
    let frame = 0;
    const maxFrames = 180; // ~3 seconds at 60fps

    const animate = () => {
      frame++;
      if (frame > maxFrames) {
        canvas.remove();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);

        if (p.shape === "square") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // star
          ctx.beginPath();
          for (let j = 0; j < 5; j++) {
            const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = j === 0 ? p.size : p.size;
            ctx.lineTo(Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5);
            const innerAngle = angle + (2 * Math.PI) / 10;
            ctx.lineTo(Math.cos(innerAngle) * r * 0.2, Math.sin(innerAngle) * r * 0.2);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      canvas.remove();
    };
  }, [active]);
}

const CelebrationModal = ({
  open,
  onClose,
  title,
  sagPlanned,
  onSave,
  xpEarned = 50,
}: CelebrationModalProps) => {
  const [celebrationNote, setCelebrationNote] = useState("");
  const [sagClaimed, setSagClaimed] = useState(false);

  useConfetti(open);

  const handleSave = () => {
    onSave(celebrationNote, sagClaimed);
    setCelebrationNote("");
    setSagClaimed(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/30 dark:to-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-amber-600 dark:text-amber-400">
            <PartyPopper className="h-7 w-7" />
            Congratulations!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Achievement */}
          <div className="rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 p-4 dark:from-violet-900/30 dark:to-indigo-900/30">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 shrink-0 text-amber-500" />
              <div>
                <p className="font-display text-lg font-bold">{title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white">
                    <Star className="mr-1 h-3 w-3" />+{xpEarned} XP
                  </Badge>
                  <Badge variant="outline" className="border-violet-300 text-violet-600 dark:text-violet-400">
                    <Sparkles className="mr-1 h-3 w-3" />Dream Achieved!
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Celebration Note */}
          <div>
            <Label className="text-sm font-medium">How do you feel? (optional)</Label>
            <Textarea
              value={celebrationNote}
              onChange={(e) => setCelebrationNote(e.target.value)}
              placeholder="I feel amazing because... This means so much to me because..."
              rows={3}
              className="mt-1.5"
            />
          </div>

          {/* SAG — Self Appreciation Gift */}
          {sagPlanned && (
            <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-800 dark:bg-pink-950/20">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 shrink-0 text-pink-500" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    Your Self-Appreciation Gift:
                  </p>
                  <p className="text-sm italic text-pink-600 dark:text-pink-400">
                    "{sagPlanned}"
                  </p>
                  <Button
                    size="sm"
                    variant={sagClaimed ? "default" : "outline"}
                    className={sagClaimed ? "bg-pink-500 hover:bg-pink-600" : "border-pink-300 text-pink-600 hover:bg-pink-100"}
                    onClick={() => setSagClaimed(!sagClaimed)}
                  >
                    <Gift className="mr-1 h-3 w-3" />
                    {sagClaimed ? "Gift Claimed! 🎁" : "Claim My Gift"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">
            <PartyPopper className="mr-1 h-4 w-4" />
            Celebrate & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CelebrationModal;
