import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plug, MessageSquare, CreditCard, Video, Camera, CheckCircle2,
  Clock, ExternalLink, ShieldCheck, Info,
} from "lucide-react";

interface Integration {
  key: string;
  name: string;
  icon: any;
  color: string;
  status: "available" | "planned";
  purpose: string;
  requires: string[];
  steps: string[];
  docs?: string;
}

const integrations: Integration[] = [
  {
    key: "whatsapp",
    name: "WhatsApp Business API (Auto-Send)",
    icon: MessageSquare,
    color: "green",
    status: "planned",
    purpose: "Automatically send follow-up reminders, appointment confirmations and offers — no manual tapping. This is the #1 automation ROI for retention.",
    requires: ["Meta Business account", "WhatsApp Business API access (Cloud API)", "Verified phone number", "Approved message templates"],
    steps: [
      "Create a Meta Business account & app at business.facebook.com",
      "Enable WhatsApp → get Phone Number ID + permanent access token",
      "Submit message templates for approval (follow-up, reminder, offer)",
      "Store token as a Supabase secret (never in frontend code)",
      "Wire the existing Follow-Up Rules to trigger sends via an edge function",
    ],
    docs: "https://developers.facebook.com/docs/whatsapp/cloud-api",
  },
  {
    key: "razorpay",
    name: "Razorpay (Online Payments)",
    icon: CreditCard,
    color: "blue",
    status: "planned",
    purpose: "Collect subscription payments and offer bookings online — auto-renew memberships and reduce manual collection.",
    requires: ["Razorpay merchant account", "KYC completed", "API key + secret", "Webhook endpoint"],
    steps: [
      "Sign up & complete KYC at razorpay.com",
      "Get Key ID + Key Secret from the dashboard",
      "Store the secret as a Supabase secret",
      "Add a checkout button to Subscriptions & Offers pages",
      "Handle payment webhooks via an edge function to activate memberships",
    ],
    docs: "https://razorpay.com/docs/",
  },
  {
    key: "youtube_api",
    name: "YouTube Data API (Live Stats)",
    icon: Video,
    color: "red",
    status: "planned",
    purpose: "Auto-pull your latest videos and show live subscriber/view counts. Note: the curated Video Library already works without this.",
    requires: ["Google Cloud project", "YouTube Data API v3 key", "Quota management"],
    steps: [
      "Create a project in Google Cloud Console",
      "Enable YouTube Data API v3 & create an API key",
      "Store the key as a Supabase secret",
      "Add an edge function to fetch channel uploads & stats",
    ],
    docs: "https://developers.google.com/youtube/v3",
  },
  {
    key: "instagram_api",
    name: "Instagram Graph API (Live Feed)",
    icon: Camera,
    color: "pink",
    status: "planned",
    purpose: "Show your live Instagram feed and follower count. Note: the Social Hub already works with manual embeds without this.",
    requires: ["Meta Business verification", "Instagram Business/Creator account", "Approved Meta app", "Long-lived token refresh"],
    steps: [
      "Convert Instagram to a Business/Creator account & link a Facebook Page",
      "Create & submit a Meta app for App Review (instagram_basic)",
      "Complete Business Verification (can take days)",
      "Store the long-lived token as a Supabase secret & refresh it",
      "Add an edge function to fetch recent media",
    ],
    docs: "https://developers.facebook.com/docs/instagram-api",
  },
];

export default function SpineIntegrations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Plug className="h-6 w-6 text-slate-600" /> Integrations & APIs</h1>
          <p className="text-muted-foreground mt-1">Connect external services to automate and scale. Set these up when you have the accounts ready.</p>
        </div>
        <Badge variant="outline" className="text-[10px]">Setup guides</Badge>
      </div>

      {/* Guidance banner */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardContent className="pt-4 text-sm text-muted-foreground flex gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Your content features already work without any of these.</p>
            <p className="mt-1">The Video Library, Social Hub, Success Stories, Offers and Subscriptions are fully functional today. These integrations add <span className="font-medium">automation</span> (auto-send, online payments, live feeds) and each needs its own account, API keys, and in some cases business verification. Keys are stored as encrypted Supabase secrets — never in the app code.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((it) => {
          const Icon = it.icon;
          return (
            <Card key={it.key}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded bg-${it.color}-100 grid place-items-center`}><Icon className={`h-4 w-4 text-${it.color}-600`} /></div>
                    <CardTitle className="text-sm">{it.name}</CardTitle>
                  </div>
                  {it.status === "available" ? (
                    <Badge className="bg-green-100 text-green-700 text-[9px]"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Available</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 text-[9px]"><Clock className="h-2.5 w-2.5 mr-0.5" /> Needs setup</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{it.purpose}</p>

                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">You'll need</p>
                  <div className="flex flex-wrap gap-1">
                    {it.requires.map((r) => <Badge key={r} variant="secondary" className="text-[9px]">{r}</Badge>)}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Setup steps</p>
                  <ol className="space-y-1">
                    {it.steps.map((s, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-muted text-[9px] shrink-0">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                {it.docs && (
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => window.open(it.docs!, "_blank")}>
                    <ExternalLink className="h-3 w-3" /> Official docs
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-4 text-xs text-muted-foreground flex gap-2">
          <Info className="h-4 w-4 shrink-0" />
          <span>When you're ready to connect any of these, share the account access / API keys and the integration can be wired up (via secure Supabase edge functions). WhatsApp auto-send and Razorpay payments give the highest immediate ROI.</span>
        </CardContent>
      </Card>
    </div>
  );
}
