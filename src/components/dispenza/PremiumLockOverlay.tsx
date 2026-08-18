import { Lock, Crown, Sparkles, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumLockOverlayProps {
  type: "premium" | "clinic";
  toolName: string;
  price?: string;
  features?: string[];
}

export function PremiumLockOverlay({ type, toolName, price = "₹2,999/month", features }: PremiumLockOverlayProps) {
  const defaultPremiumFeatures = [
    "Full access to all 10 Dispenza meditation tools",
    "Step-by-step guided sessions with timers",
    "Coherence Score tracking & spine correlation",
    "Doctor-prescribed personalized protocols",
    "Weekly group coherence healing sessions",
    "Progress analytics & healing milestones",
  ];

  const defaultClinicFeatures = [
    "In-clinic facilitated group sessions",
    "Direct healing intention from practitioners",
    "Documented recovery amplification",
    "Priority booking for monthly events",
  ];

  const displayFeatures = features || (type === "premium" ? defaultPremiumFeatures : defaultClinicFeatures);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full border-2 border-purple-300 shadow-2xl">
        <CardContent className="p-6 text-center space-y-4">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-amber-100 flex items-center justify-center">
            {type === "premium" ? (
              <Crown className="w-8 h-8 text-amber-500" />
            ) : (
              <Building2 className="w-8 h-8 text-purple-600" />
            )}
          </div>

          {/* Title */}
          <div>
            <Badge className={`mb-2 ${type === "premium" ? "bg-amber-100 text-amber-700 border-amber-300" : "bg-purple-100 text-purple-700 border-purple-300"}`}>
              {type === "premium" ? (
                <><Lock className="w-3 h-3 mr-1" /> Premium Tool</>
              ) : (
                <><Building2 className="w-3 h-3 mr-1" /> Clinic Membership</>
              )}
            </Badge>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{toolName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {type === "premium"
                ? "This is a premium meditation tool. Upgrade to access the full Dispenza Healing Program."
                : "This requires an active clinic membership. Join our healing community to participate."
              }
            </p>
          </div>

          {/* Features */}
          <div className="text-left space-y-2 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              {type === "premium" ? "Premium includes:" : "Clinic membership includes:"}
            </p>
            {displayFeatures.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <Sparkles className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-xs text-gray-700">{f}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="py-2">
            {type === "premium" ? (
              <div>
                <span className="text-3xl font-bold text-purple-700">{price}</span>
                <p className="text-xs text-gray-500 mt-1">or ₹14,999 for 6-month full program</p>
              </div>
            ) : (
              <div>
                <span className="text-3xl font-bold text-purple-700">₹3,500/month</span>
                <p className="text-xs text-gray-500 mt-1">Includes weekly group sessions + all premium tools</p>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-semibold">
              <Crown className="w-4 h-4 mr-2" />
              {type === "premium" ? "Upgrade to Premium" : "Join Clinic Membership"}
            </Button>
            <Button variant="outline" className="w-full text-sm" onClick={() => window.history.back()}>
              ← Go Back (Try Free Tools First)
            </Button>
            <div className="flex items-center justify-center gap-2 pt-1">
              <Phone className="w-3 h-3 text-green-600" />
              <span className="text-xs text-gray-500">Questions? WhatsApp: +91 94444 XXXXX</span>
            </div>
          </div>

          {/* Free tools hint */}
          {type === "premium" && (
            <p className="text-[11px] text-gray-400 pt-2 border-t">
              Free tools available: Space-Time (Open Focus) & Elevated Emotion Journal — no subscription needed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ClinicMembershipLockOverlay({ toolName }: { toolName: string }) {
  return <PremiumLockOverlay type="clinic" toolName={toolName} />;
}
