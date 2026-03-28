"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { User, Mail, Upload, Shield, CheckCircle, Clock, Camera } from "lucide-react";
import Image from "next/image";
import TrustProfile from "@/components/trust/TrustProfile";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" },
  }),
};

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const { authHeaders } = useApi();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || "");
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [verificationDoc, setVerificationDoc] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    setUsername(user.username);
    setAvatarPreview(user.avatar || "");
  }, [user, router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const { data } = await axios.post("/api/upload", { image: base64 }, authHeaders());
        setAvatarPreview(data.data.url);
      } catch {
        setAvatarPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const { data } = await axios.post("/api/upload", { image: base64 }, authHeaders());
        setVerificationDoc(data.data.url);
        toast.success("Document uploaded — save to submit for verification");
      } catch {
        setVerificationDoc(base64);
      } finally {
        setUploadingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/user/profile", {
        username,
        avatar: avatarPreview,
        ...(verificationDoc ? { verificationDoc } : {}),
      }, authHeaders());
      await fetchMe();
      toast.success("Profile updated!");
      setVerificationDoc(null);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isVerified = (user as any).ownerVerified;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        {/* Header */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1">Profile</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your account settings</p>
        </motion.div>

        {/* Main card */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 p-5 sm:p-6 space-y-6"
        >
          {/* Avatar */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="relative cursor-pointer"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 rounded-2xl bg-rose-100 dark:bg-rose-950 overflow-hidden flex items-center justify-center"
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-3xl font-bold text-rose-500">{user.username[0].toUpperCase()}</span>
                )}
              </motion.div>
              <AnimatePresence>
                {avatarHover && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors shadow-md">
                <Upload className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-white">{user.username}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">{user.role}</p>
                {user.role === "owner" && (
                  isVerified ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full"
                    >
                      <CheckCircle className="w-3 h-3" /> Verified
                    </motion.span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Unverified
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="w-4 h-4" />}
          />

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1.5">Email</label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</span>
            </div>
          </div>

          {/* Owner verification */}
          <AnimatePresence>
            {user.role === "owner" && !isVerified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900"
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Get Verified</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5 mb-3">
                      Upload a government ID or business document to get a verified badge on your listings.
                    </p>
                    <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors w-fit">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        {uploadingDoc ? "Uploading..." : verificationDoc ? "Document ready ✓" : "Upload Document"}
                      </span>
                      <input type="file" accept="image/*,.pdf" onChange={handleDocUpload} className="hidden" disabled={uploadingDoc} />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={handleSave} isLoading={saving} className="w-full">
            Save Changes
          </Button>
        </motion.div>

        {/* Trust profile */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6"
        >
          <TrustProfile userId={user._id} />
        </motion.div>
      </div>
    </div>
  );
}
