"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  show: boolean;
}

export default function OnboardingTour({ steps, onComplete, show }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!show) return;

    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        const placement = steps[currentStep].placement || "bottom";

        let top = 0;
        let left = 0;

        switch (placement) {
          case "bottom":
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2;
            break;
          case "top":
            top = rect.top - 10;
            left = rect.left + rect.width / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2;
            left = rect.left - 10;
            break;
          case "right":
            top = rect.top + rect.height / 2;
            left = rect.right + 10;
            break;
        }

        setPosition({ top, left });

        // Highlight target
        target.classList.add("onboarding-highlight");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        target.classList.remove("onboarding-highlight");
      }
    };
  }, [currentStep, show, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      target.classList.remove("onboarding-highlight");
    }
    onComplete();
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={handleComplete}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            transform: "translate(-50%, 0)",
            zIndex: 101,
          }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-sm w-full"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                {steps[currentStep].title}
              </h3>
              <p className="text-xs text-zinc-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleComplete}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {steps[currentStep].content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? "w-6 bg-emerald-500"
                      : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-3 h-3" />
                  </>
                ) : (
                  "Got it!"
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .onboarding-highlight {
          position: relative;
          z-index: 101;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.5);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}
