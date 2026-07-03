import { usePageSEO } from "@/hooks/usePageSEO";

const SymptomChecker = () => {
  usePageSEO({
    title: "Symptom Checker",
    description: "Guided AYUSH symptom triage — coming soon on Ayuzee.",
    canonicalPath: "/diagnosis/symptoms",
    noIndex: true,
  });

  return (
    <main className="container py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Coming soon</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Symptom Checker</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
        Guided AYUSH symptom triage is being prepared for Ayuzee users.
      </p>
    </main>
  );
};

export default SymptomChecker;
