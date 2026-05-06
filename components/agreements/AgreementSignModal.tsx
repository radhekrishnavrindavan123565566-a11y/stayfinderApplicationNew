"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

interface AgreementSignModalProps {
  agreementId: string;
  onSigned: (updatedAgreement: any) => void;
  onClose: () => void;
}

type ModalStep = "otp" | "signature";

export default function AgreementSignModal({ agreementId, onSigned, onClose }: AgreementSignModalProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<ModalStep>("otp");
  const [otp, setOtp] = useState("");
  const [signature, setSignature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "your email";

  const handleSendOtp = async () => {
    if (!user?.email) {
      toast.error("Email not found");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/auth/send-otp", {
        email: user.email,
        action: "sign-agreement",
      });
      setOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to send OTP");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setStep("signature");
  };

  const handleSign = async () => {
    if (!signature.trim()) {
      toast.error("Please enter your signature");
      return;
    }

    if (!user?.email) {
      toast.error("Email not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`/api/agreements/${agreementId}/sign`, {
        signature: signature.trim(),
        otp,
        email: user.email,
      });
      onSigned(response.data.data.agreement);
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.error;

        if (status === 401) {
          toast.error(message || "Invalid or expired OTP");
          setStep("otp");
          setOtp("");
        } else if (status === 409) {
          toast.error(message || "Signing error");
        } else {
          toast.error(message || "Failed to sign agreement");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Sign Agreement
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Verify your identity
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      We'll send a 6-digit code to {maskedEmail}
                    </p>
                  </div>
                </div>

                {!otpSent ? (
                  <Button
                    onClick={handleSendOtp}
                    isLoading={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send OTP
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSendOtp}
                        variant="secondary"
                        isLoading={isLoading}
                        className="flex-1"
                      >
                        Resend OTP
                      </Button>
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={otp.length !== 6}
                        className="flex-1"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === "signature" && (
              <motion.div
                key="signature"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      OTP verified successfully
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Now enter your signature to complete signing
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Type your full name as signature
                  </label>
                  <input
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your full name"
                    autoFocus
                  />
                  {signature && (
                    <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Preview:</p>
                      <p className="text-2xl font-serif italic text-blue-600 dark:text-blue-400">
                        {signature}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setStep("otp");
                      setOtp("");
                    }}
                    variant="secondary"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSign}
                    isLoading={isLoading}
                    disabled={!signature.trim()}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      "Sign Agreement"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
