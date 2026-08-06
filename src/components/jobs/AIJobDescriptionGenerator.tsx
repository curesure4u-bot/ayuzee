import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GeneratedContent = {
  description: string;
  requirements: string;
};

type Props = {
  jobTitle: string;
  department: string;
  organizationType: string;
  organizationName: string;
  specialization: string;
  jobType: string;
  experienceMin: string;
  onApply: (content: GeneratedContent) => void;
};

export const AIJobDescriptionGenerator = ({
  jobTitle,
  department,
  organizationType,
  organizationName,
  specialization,
  jobType,
  experienceMin,
  onApply,
}: Props) => {
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<GeneratedContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const generate = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a job title first");
      return;
    }

    setGenerating(true);

    const prompt = `You are an expert AYUSH healthcare recruiter. Generate a professional job description and requirements section for the following AYUSH job posting.

Job Details:
- Job Title: ${jobTitle}
- Department/Specialization: ${department || specialization || "General AYUSH"}
- Organization Type: ${organizationType}
- Organization Name: ${organizationName || "AYUSH Healthcare Organization"}
- Job Type: ${jobType.replace("_", " ")}
- Minimum Experience: ${experienceMin || "0"} years

Instructions:
1. Write a compelling, detailed job description (150-250 words) that covers:
   - Role overview and purpose
   - Key responsibilities (5-7 bullet points)
   - Work environment and team structure
   - Growth opportunities

2. Write clear requirements/qualifications (100-150 words) including:
   - Educational qualifications (BAMS/BHMS/BUMS/BNYS as appropriate)
   - Required certifications or registrations
   - Skills and competencies
   - Preferred additional qualifications

Keep the tone professional but warm. Use AYUSH-specific terminology appropriately. Format with bullet points using "•" character.

Respond ONLY with valid JSON in this exact format:
{"description": "...", "requirements": "..."}`;

    try {
      const { data, error } = await supabase.functions.invoke("ai-gateway", {
        body: {
          feature: "job_description_generator",
          prompt,
          max_tokens: 1500,
        },
      });

      if (error) throw error;

      // Parse the response - it may be in data.response or data.result
      let parsed: GeneratedContent;
      if (data?.result) {
        parsed = data.result;
      } else if (data?.response) {
        // Try to extract JSON from the response text
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse AI response");
        }
      } else {
        throw new Error("Empty response from AI");
      }

      setPreview(parsed);
      setShowPreview(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate description. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const applyGenerated = () => {
    if (preview) {
      onApply(preview);
      setShowPreview(false);
      setPreview(null);
      toast.success("AI-generated content applied! You can edit it further.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={generate}
        disabled={generating}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
      >
        {generating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            AI Generate Description
          </>
        )}
      </Button>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI-Generated Job Description
            </DialogTitle>
            <DialogDescription>
              Review the generated content below. Click "Use This" to apply it to your form, or close to discard.
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Job Description</h3>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                  {preview.description}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Requirements & Qualifications</h3>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                  {preview.requirements}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Discard
            </Button>
            <Button variant="outline" onClick={generate} disabled={generating}>
              {generating ? "Regenerating..." : "Regenerate"}
            </Button>
            <Button variant="hero" onClick={applyGenerated}>
              Use This
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
