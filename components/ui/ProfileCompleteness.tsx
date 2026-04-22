"use client";
import { motion } from "framer-motion";
import { CheckCircle, Circle, User, Mail, Image, Shield, Star } from "lucide-react";
import Link from "next/link";
import { User as UserType } from "@/store/authStore";

interface Props {
  user: UserType & { avatar?: string; verificationDoc?: string };
}

export default function ProfileCompleteness({ user }: Props) {
  const steps = [
    { label: "Username set",       done: !!user.username,         icon: <User className="w-3.5 h-3.5" /> },
    { label: "Email verified",     done: !!user.email,            icon: <Mail className="w-3.5 h-3.5" /> },
    { label: "Avatar uploaded",    done: !!user.avatar,           icon: <Image className="w-3.5 h-3.5" /> },
    { label: "Profile complete",   done: (user as unknown as { profileCompleteness?: number }).profileCompleteness ? (user as unknown as { profileCompleteness: number }).profileCompleteness >= 80 : false, icon: <Star className="w-3.5 h-3.5" /> },
    ...(user.role === "owner" ? [
      { label: "Owner verified", done: !!(user as unknown as { ownerVerified?: boolean }).ownerVerified, icon: <Shield className="w-3.5 h-3.5" /> },
    ] : []),
  ];

  const completed = steps.filter(s => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  if (pct === 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white text-sm">Complete your profile</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{completed} of {steps.length} steps done</p>
        </div>
        <span className={`text-2xl font-bold ${pct >= 80 ? "text-green-500" : pct >= 50 ? "text-amber-500" : "text-rose-500"}`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-2.5">
            {step.done
              ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
            }
            <span className={`text-xs flex items-center gap-1.5 ${step.done ? "text-zinc-400 dark:text-zinc-500 line-through" : "text-zinc-700 dark:text-zinc-300"}`}>
              <span className="text-zinc-400">{step.icon}</span>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <Link href="/profile"
        className="mt-4 block text-center text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors">
        Complete profile →
      </Link>
    </motion.div>
  );
}
