"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Send, X, Play, Pause } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface VoiceMessageRecorderProps {
  recipientId: string;
  onSendSuccess?: () => void;
}

export function VoiceMessageRecorder({
  recipientId,
  onSendSuccess,
}: VoiceMessageRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!recordedUrl) {
      toast.error("No recording found");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(recordedUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("audio", blob, "voice-message.webm");
      formData.append("recipientId", recipientId);

      await axios.post("/api/messages/voice", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Voice message sent!");
      setRecordedUrl(null);
      setIsOpen(false);
      onSendSuccess?.();
    } catch (error) {
      toast.error("Failed to send voice message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all"
      >
        <Mic className="w-4 h-4" />
        Voice
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-white">
                Record Voice Message
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setRecordedUrl(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {!recordedUrl ? (
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-full py-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-3 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </motion.button>
                  <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    {isRecording
                      ? "Recording... Click to stop"
                      : "Click to start recording your message"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        Preview
                      </span>
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            if (isPlaying) {
                              audioRef.current.pause();
                            } else {
                              audioRef.current.play();
                            }
                            setIsPlaying(!isPlaying);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </button>
                    </div>
                    <audio
                      ref={audioRef}
                      src={recordedUrl}
                      className="w-full"
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setRecordedUrl(null);
                      setIsPlaying(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Re-record
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSend}
                    disabled={isSending}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Voice Message
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
