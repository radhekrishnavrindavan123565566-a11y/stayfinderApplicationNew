"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { FileText, CheckCircle, Clock, PenLine, Download, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false }
);
import { AgreementPDF } from "@/lib/agreementTemplate";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" },
  }),
};

export default function AgreementPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureInput, setSignatureInput] = useState("");
  const [showSignForm, setShowSignForm] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    axios.get(`/api/agreements/${id}`, authHeaders())
      .then(({ data }) => setAgreement(data.data.agreement))
      .catch(() => toast.error("Failed to load agreement"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const sign = async () => {
    if (!signatureInput.trim()) { toast.error("Enter your full name as signature"); return; }
    setSigning(true);
    try {
      const { data } = await axios.post(`/api/agreements/${id}/sign`, { signature: signatureInput }, authHeaders());
      setAgreement(data.data.agreement);
      setShowSignForm(false);
      toast.success("Agreement signed!");
    } catch {
      toast.error("Failed to sign");
    } finally { setSigning(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
    </div>
  );

  if (!agreement) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-zinc-500 dark:text-zinc-400">Agreement not found</p>
      </motion.div>
    </div>
  );

  const isTenant = agreement.tenantId?._id === user?._id;
  const isOwner = agreement.ownerId?._id === user?._id;
  const mySignature = isTenant ? agreement.tenantSignature : agreement.ownerSignature;
  const canSign = !mySignature && (isTenant || isOwner);

  const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: "Draft", color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400", icon: <FileText className="w-4 h-4" /> },
    pending_tenant: { label: "Awaiting Tenant", color: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400", icon: <Clock className="w-4 h-4" /> },
    pending_owner: { label: "Awaiting Owner", color: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400", icon: <Clock className="w-4 h-4" /> },
    fully_signed: { label: "Fully Signed", color: "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400", icon: <CheckCircle className="w-4 h-4" /> },
    expired: { label: "Expired", color: "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400", icon: <Clock className="w-4 h-4" /> },
  };
  const statusConfig = STATUS_MAP[agreement.status] ?? { label: agreement.status, color: "bg-zinc-100 text-zinc-600", icon: null };

  const pdfData = {
    agreementId: agreement._id,
    tenantName: agreement.tenantId?.username || "",
    ownerName: agreement.ownerId?.username || "",
    propertyTitle: agreement.propertyId?.title || "",
    propertyAddress: `${agreement.propertyId?.location?.address || ""}, ${agreement.propertyId?.location?.city || ""}`,
    monthlyRent: agreement.propertyId?.price || 0,
    startDate: format(new Date(agreement.validFrom), "MMM d, yyyy"),
    endDate: format(new Date(agreement.validUntil), "MMM d, yyyy"),
    tenantSignature: agreement.tenantSignature,
    ownerSignature: agreement.ownerSignature,
  };

  const parties = [
    { label: "Owner", username: agreement.ownerId?.username, signature: agreement.ownerSignature, signedAt: agreement.ownerSignedAt },
    { label: "Tenant", username: agreement.tenantId?.username, signature: agreement.tenantSignature, signedAt: agreement.tenantSignedAt },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">

        {/* Header */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </button>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-6 h-6 text-rose-500 flex-shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate">Rental Agreement</h1>
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${statusConfig.color}`}>
              {statusConfig.icon} {statusConfig.label}
            </motion.div>
          </div>
        </motion.div>

        {/* Agreement text */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show"
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 mb-4 shadow-sm">
          <pre className="whitespace-pre-wrap text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-mono leading-relaxed overflow-x-auto">
            {agreement.agreementText}
          </pre>
        </motion.div>

        {/* Signatures */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 mb-4 shadow-sm">
          <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Signatures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {parties.map((party) => (
              <div key={party.label} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{party.label}</p>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">{party.username}</p>
                <AnimatePresence mode="wait">
                  {party.signature ? (
                    <motion.div key="signed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 italic">{party.signature}</p>
                      {party.signedAt && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {format(new Date(party.signedAt), "MMM d, yyyy HH:mm")}
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.p key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-xs text-amber-500 dark:text-amber-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className="flex flex-wrap gap-3">
          {canSign && !showSignForm && (
            <Button onClick={() => setShowSignForm(true)} className="gap-2">
              <PenLine className="w-4 h-4" /> Sign Agreement
            </Button>
          )}
          <PDFDownloadLink document={<AgreementPDF data={pdfData} />} fileName={`agreement-${agreement._id}.pdf`}>
            {({ loading: pdfLoading }) => (
              <button disabled={pdfLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 text-sm">
                <Download className="w-4 h-4" />
                {pdfLoading ? "Generating..." : "Download PDF"}
              </button>
            )}
          </PDFDownloadLink>
        </motion.div>

        {/* Sign form */}
        <AnimatePresence>
          {showSignForm && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Sign Agreement</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">Type your full name as your digital signature</p>
                <input
                  value={signatureInput}
                  onChange={(e) => setSignatureInput(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-600 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 mb-3 italic font-semibold"
                />
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={sign} isLoading={signing} className="gap-2">
                    <CheckCircle className="w-4 h-4" /> Confirm Signature
                  </Button>
                  <button onClick={() => setShowSignForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
