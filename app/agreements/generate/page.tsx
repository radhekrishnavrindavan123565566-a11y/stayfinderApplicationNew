"use client";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import AgreementGeneratorForm from "@/components/agreements/AgreementGeneratorForm";
import { Loader2 } from "lucide-react";

export default function GenerateAgreementPage() {
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
      <AgreementGeneratorForm />
    </div>
  );
}
