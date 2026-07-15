import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Props = {
  diseaseName: string;
  diseaseKey: string;
  protocol?: string;
};

export default function BookPanchakarmaButton({ diseaseName, diseaseKey, protocol }: Props) {
  const navigate = useNavigate();
  return (
    <Button
      size="sm"
      className="gap-2"
      onClick={() =>
        navigate(
          `/vaidya/appointments/new?type=panchakarma&disease=${encodeURIComponent(diseaseKey)}&name=${encodeURIComponent(diseaseName)}${protocol ? `&note=${encodeURIComponent(protocol)}` : ""}`,
        )
      }
    >
      <Sparkles className="h-4 w-4" />
      Book Panchakarma
    </Button>
  );
}
