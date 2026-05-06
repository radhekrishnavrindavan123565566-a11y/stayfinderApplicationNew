"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AgreementPDF, AgreementData } from "@/lib/agreementTemplate";
import AgreementSignModal from "./AgreementSignModal";

const agreementSchema = z.object({
  tenantName: z.string().min(1, "Tenant name is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  propertyTitle: z.string().min(1, "Property title is required"),
  propertyAddress: z.string().min(1, "Property address is required"),
  monthlyRent: z.number().min(1, "Monthly rent must be greater than 0"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  language: z.enum(["english", "hindi"]),
  propertyId: z.string().optional(),
  bookingId: z.string().optional(),
});

type AgreementFormInput = z.infer<typeof agreementSchema>;

type Step = "form" | "preview" | "signing";

interface GeneratedAgreement {
  _id: string;
  agreementText: string;
  status: string;
  tenantSignature?: string;
  ownerSignature?: string;
  tenantSignedAt?: string;
  ownerSignedAt?: string;
}

export default function AgreementGeneratorForm() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>("form");
  const [agreement, setAgreement] = useState<GeneratedAgreement | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [formData, setFormData] = useState<AgreementFormInput | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AgreementFormInput>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      language: "english",
    },
  });

  const onSubmit = async (data: AgreementFormInput) => {
    try {
      setFormData(data);
      const response = await axios.post("/api/agreements/generate", data);
      setAgreement(response.data.data.agreement);
      setStep("preview");
      toast.success("Agreement generated successfully!");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to generate agreement");
      }
    }
  };

  const handleSigned = (updatedAgreement: any) => {
    setAgreement(updatedAgreement);
    toast.success("Agreement signed successfully!");
  };

  const getPdfData = (): AgreementData | null => {
    if (!agreement || !formData) return null;
    return {
      agreementId: agreement._id,
      tenantName: formData.tenantName,
      ownerName: formData.ownerName,
      propertyTitle: formData.propertyTitle,
      propertyAddress: formData.propertyAddress,
      monthlyRent: formData.monthlyRent,
      startDate: formData.startDate,
      endDate: formData.endDate,
      tenantSignature: agreement.tenantSignature,
      ownerSignature: agreement.ownerSignature,
    };
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
        <p className="text-amber-700 dark:text-amber-400 font-medium">Please log in to generate agreements</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Generate Rental Agreement</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Tenant Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Tenant Name
                </label>
                <input
                  type="text"
                  {...register("tenantName")}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter tenant's full name"
                />
                {errors.tenantName && <p className="text-xs text-red-500 mt-1">{errors.tenantName.message}</p>}
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  {...register("ownerName")}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter owner's full name"
                />
                {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName.message}</p>}
              </div>

              {/* Property Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Property Title
                </label>
                <input
                  type="text"
                  {...register("propertyTitle")}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 2BHK Apartment in Civil Lines"
                />
                {errors.propertyTitle && <p className="text-xs text-red-500 mt-1">{errors.propertyTitle.message}</p>}
              </div>

              {/* Property Address */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Property Address
                </label>
                <textarea
                  {...register("propertyAddress")}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Enter complete property address"
                />
                {errors.propertyAddress && <p className="text-xs text-red-500 mt-1">{errors.propertyAddress.message}</p>}
              </div>

              {/* Monthly Rent */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  {...register("monthlyRent", { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter monthly rent amount"
                />
                {errors.monthlyRent && <p className="text-xs text-red-500 mt-1">{errors.monthlyRent.message}</p>}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    {...register("endDate")}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Agreement Language
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="english"
                      {...register("language")}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">English</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="hindi"
                      {...register("language")}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Hindi (हिंदी)</span>
                  </label>
                </div>
                {errors.language && <p className="text-xs text-red-500 mt-1">{errors.language.message}</p>}
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? "Generating..." : "Generate Agreement"}
              </Button>
            </form>
          </motion.div>
        )}

        {step === "preview" && agreement && formData && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Agreement Preview</h2>
                </div>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-full">
                  {agreement.status}
                </span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 font-mono">
                  {agreement.agreementText}
                </pre>
              </div>

              <div className="flex gap-4">
                <PDFDownloadLink
                  document={<AgreementPDF data={getPdfData()!} />}
                  fileName={`agreement-${agreement._id}.pdf`}
                  className="flex-1"
                >
                  {({ loading }) => (
                    <Button
                      variant="secondary"
                      className="w-full"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Preparing PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>

                <Button
                  onClick={() => setShowSignModal(true)}
                  className="flex-1"
                  size="lg"
                >
                  Sign Agreement
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSignModal && agreement && (
        <AgreementSignModal
          agreementId={agreement._id}
          onSigned={handleSigned}
          onClose={() => setShowSignModal(false)}
        />
      )}
    </div>
  );
}
